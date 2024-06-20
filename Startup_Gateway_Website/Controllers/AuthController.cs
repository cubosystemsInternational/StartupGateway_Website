using Azure.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Polly;
using Startup_Gateway_Website.Utils;
using System.IdentityModel.Tokens.Jwt;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;

namespace Startup_Gateway_Website.Controllers
{
	[Route("[controller]/[action]")]
	[ApiController]
	public class AuthController : ControllerBase
	{
		[HttpGet("test")]
		public IActionResult Welcome()
		{
			return Content("This is the test action method...");
		}

        [HttpGet("Access")]
        public IActionResult Login([FromQuery] string accessToken, [FromQuery] string refreshToken)
        {
            if (!string.IsNullOrEmpty(accessToken) && !string.IsNullOrEmpty(refreshToken))
            {
                // Decode the access token to get the expiration time
                var accessTokenPayload = TokenUtils.DecodeAccessToken(accessToken);
                // Convert Unix timestamp to DateTimeOffset
                var expUnixTimestamp = (long)accessTokenPayload["exp"];
                var expDateTimeOffset = DateTimeOffset.FromUnixTimeSeconds(expUnixTimestamp);

                // Convert DateTimeOffset directly to UTC
                var utcExpirationTime = expDateTimeOffset.UtcDateTime;

                // Set the access token as an HTTP-only cookie
                Response.Cookies.Append("accessToken", accessToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = Request.IsHttps, // Ensure the cookie is sent over HTTPS if the request is secure
                    SameSite = SameSiteMode.Strict,
                    Expires = utcExpirationTime // Set the expiration time in UTC directly
                });

                // Set the refresh token as an HTTP-only cookie
                Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = Request.IsHttps,
                    SameSite = SameSiteMode.Strict
                });

                // Set IsLoggedIn cookie
                Response.Cookies.Append("IsLoggedIn", "true", new CookieOptions
                {
                    HttpOnly = true, // Allow client-side JavaScript to access this cookie
                    Secure = Request.IsHttps,
                    SameSite = SameSiteMode.Strict
                });
            }

            // Redirect to the Home page, for example, the dashboard
            return Redirect("/");
        }

        //private async Task CreateSessionAndTrack()
        //{
        //    var sessionId = Request.Cookies["VisitorSessionId"];
        //    if (string.IsNullOrEmpty(sessionId))
        //    {
        //        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        //        var device = Request.Headers["User-Agent"].ToString();
        //        var userId = User?.Identity?.IsAuthenticated == true ? (int?)int.Parse(User.Identity.Name) : null;

        //        var client = _clientFactory.CreateClient();

        //        var session = new
        //        {
        //            Ip = ip,
        //            Device = device,
        //            UserId = userId,
        //            Status = "active",
        //            ModifiedBy = "system",
        //            DateTime = DateTime.UtcNow,
        //            ModifiedOn = DateTime.UtcNow
        //        };

        //        var response = await client.PostAsJsonAsync("https://yourapi.com/api/visitortracking/logsession", session);
        //        response.EnsureSuccessStatusCode();

        //        sessionId = await response.Content.ReadAsStringAsync();
        //        Response.Cookies.Append("VisitorSessionId", sessionId, new CookieOptions
        //        {
        //            HttpOnly = true,
        //            Secure = Request.IsHttps,
        //            SameSite = SameSiteMode.Strict,
        //            Expires = DateTimeOffset.UtcNow.AddYears(1)
        //        });
        //    }

        //    // Track the session activity
        //    var trackSession = new
        //    {
        //        VisitorSessionId = sessionId,
        //        DateTime = DateTime.UtcNow,
        //        OriginalUrl = Request.Headers["Referer"].ToString(),
        //        CurrentUrl = Request.Path.ToString(),
        //        Status = "active",
        //        ModifiedBy = "system",
        //        ModifiedOn = DateTime.UtcNow
        //    };

        //    var trackingClient = _clientFactory.CreateClient();
        //    var trackingResponse = await trackingClient.PostAsJsonAsync("https://yourapi.com/api/visitortracking/track", trackSession);
        //    trackingResponse.EnsureSuccessStatusCode();
        //}

        [HttpGet]
		public IActionResult GetAccessToken()
		{
			//var accessToken = Request.Cookies["accessToken"];
			//return Content(accessToken);

			// Get the access token from the cookie
			var accessToken = Request.Cookies["accessToken"];

			// Check if the access token is null or empty
			if (string.IsNullOrEmpty(accessToken))
			{
				return BadRequest("Access token not found in cookie.");
			}

			try
			{
				// Decode the JWT token
				var handler = new JwtSecurityTokenHandler();
				var token = handler.ReadJwtToken(accessToken);

				// Deserialize the payload into a dynamic object
				dynamic payload = JsonConvert.DeserializeObject<dynamic>(token.Payload.SerializeToJson());

				// Return the payload details as JSON
				return Ok(payload);
			}
			catch (Exception ex)
			{
				return BadRequest("Error decoding access token: " + ex.Message);
			}
		}

        [HttpPost]
        public IActionResult RefreshAccessToken([FromBody] string refreshToken)
        {
            try
            {
                var newAccessToken = TokenUtils.GetNewAccessToken(refreshToken);
                if (!string.IsNullOrEmpty(newAccessToken))
                {
                    // Deserialize the JSON response to extract the access token
                    JObject tokenObject = JObject.Parse(newAccessToken);
                    string accessToken = (string)tokenObject["accessToken"];

                    if (!string.IsNullOrEmpty(accessToken))
                    {
                        // Decode the access token to get the expiration time
                        var accessTokenPayload = TokenUtils.DecodeAccessToken(accessToken);
                        // Convert Unix timestamp to DateTimeOffset
                        var expUnixTimestamp = (long)accessTokenPayload["exp"];
                        var expDateTimeOffset = DateTimeOffset.FromUnixTimeSeconds(expUnixTimestamp);

                        // Set the expiration time directly as UTC
                        var utcExpirationTime = expDateTimeOffset.UtcDateTime;

                        // Set the access token as an HTTP-only cookie
                        Response.Cookies.Append("accessToken", accessToken, new CookieOptions
                        {
                            HttpOnly = true,
                            Secure = Request.IsHttps, // Ensure the cookie is sent over HTTPS if the request is secure
                            SameSite = SameSiteMode.Strict, // Adjust as per your security requirements
                            Expires = utcExpirationTime // Set the expiration time in UTC
                        });

                        return Ok("Sucessfully Recived AccessToken");
                    }
                    else
                    {
                        // If accessToken is null or empty, remove the existing access token cookie

                        Response.Cookies.Delete("IsLoggedIn");
                        Response.Cookies.Delete("accessToken");
                        Response.Cookies.Delete("refreshToken");
                        return BadRequest("Failed to refresh access token. New access token is null or empty.");
                    }
                }
                else
                {
                    // If newAccessToken is null or empty, remove the existing access token cookie

                    Response.Cookies.Delete("IsLoggedIn");
                    Response.Cookies.Delete("accessToken");
                    Response.Cookies.Delete("refreshToken");
                    return BadRequest("Failed to refresh access token. New access token is null or empty.");
                }
            }
            catch (Exception ex)
            {
                // Handle the error
                return BadRequest("Error occurred while refreshing access token: " + ex.Message);
            }
        }




        [HttpGet]
        public IActionResult LogoutUser()
        {
            try
            {
                // Get access and refresh tokens from cookies
                var accessToken = Request.Cookies["accessToken"];
                var refreshToken = Request.Cookies["refreshToken"];

                if (accessToken != null && refreshToken != null)
                {
                    bool isTokenRevoked = TokenUtils.RevokeTheToken(refreshToken, accessToken);

                    if (isTokenRevoked)
                    {
                        // Remove cookies
                        Response.Cookies.Delete("IsLoggedIn");
                        Response.Cookies.Delete("accessToken");
                        Response.Cookies.Delete("refreshToken");

                        // Redirect to root URL
                        return Ok("Successfully Logged Out and revoked tokens.");
                    }
                    else
                    {
                        return BadRequest("Failed to revoke tokens.");
                    }
                }
                else
                {
                    return BadRequest("Access token or refresh token not found in cookies.");
                }
            }
            catch (Exception ex)
            {
                // Log and handle the error
                return BadRequest("Error occurred while logging out: " + ex.Message);
            }
        }


    }
}
