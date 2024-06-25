using Azure.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Polly;
using Startup_Gateway_Website.Models.Request;
using Startup_Gateway_Website.Models.Response;
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
        private readonly IHttpClientFactory _clientFactory;
        private readonly VisitorSessionUtils _visitorSessionUtils;

        public AuthController(IHttpClientFactory clientFactory, VisitorSessionUtils visitorSessionUtils)
        {
            _clientFactory = clientFactory;
            _visitorSessionUtils = visitorSessionUtils; 
        }

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
                // Set a flag to indicate a successful login
                Response.Cookies.Append("UpdateUserIdentity", "true", new CookieOptions
                {
                    HttpOnly = false,
                    Secure = Request.IsHttps,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddMinutes(5) // Short-lived cookie
                });
            }

            // Redirect to the Home page, for example, the dashboard
            return Redirect("/");
        }

        [HttpPost]
        public async Task<IActionResult> CheckAndTrackVisitorSession([FromBody] VisitorSessionRequest request)
        {
            try
            {
                var visitorSessionUUID = Request.Cookies["VisitorSessionUUID"];
                var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
                var visitorSessionId = Request.Cookies["VisitorSessionId"];
                if (string.IsNullOrEmpty(visitorSessionUUID) && string.IsNullOrEmpty(visitorSessionId))
                {
                    var sessionResult = await _visitorSessionUtils.CreateSessionAsync(request,ip);
                    visitorSessionUUID = sessionResult.VisitorSessionUUID;
                    visitorSessionId = sessionResult.Id.ToString();

                    Response.Cookies.Append("VisitorSessionUUID", visitorSessionUUID, new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = Request.IsHttps,
                        SameSite = SameSiteMode.Strict,
                        Expires = DateTimeOffset.UtcNow.AddDays(7)
                    });
                    Response.Cookies.Append("VisitorSessionId", visitorSessionId, new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = Request.IsHttps,
                        SameSite = SameSiteMode.Strict,
                        Expires = DateTimeOffset.UtcNow.AddDays(7)
                    });


                }
                // Track the session activity
                await _visitorSessionUtils.TrackSessionActivityAsync(request.OriginUrl, request.CurrentUrl, request.UserId, int.Parse(visitorSessionId));


                return Ok(new { Message = "Visitor session checked and tracked successfully." });
            }
            catch (Exception ex)
            {
                // Add proper logging here
                return StatusCode(500, new { Message = "An error occurred while checking and tracking the visitor session.", Details = ex.Message });
            }
        }

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
                        Response.Cookies.Delete("VisitorSessionId");
                        Response.Cookies.Delete("VisitorSessionUUID");
                        Response.Cookies.Delete("UpdateUserIdentity");
                        return BadRequest("Failed to refresh access token. New access token is null or empty.");
                    }
                }
                else
                {
                    // If newAccessToken is null or empty, remove the existing access token cookie

                    Response.Cookies.Delete("IsLoggedIn");
                    Response.Cookies.Delete("accessToken");
                    Response.Cookies.Delete("refreshToken");
                    Response.Cookies.Delete("VisitorSessionId");
                    Response.Cookies.Delete("VisitorSessionUUID");
                    Response.Cookies.Delete("UpdateUserIdentity");
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
        public async Task<IActionResult> LogoutUser()
        {
            try
            {
                // Get access and refresh tokens from cookies
                var accessToken = Request.Cookies["accessToken"];
                var refreshToken = Request.Cookies["refreshToken"];
                var visitorSessionUUID = Request.Cookies["VisitorSessionUUID"];
                var visitorSessionId = Request.Cookies["VisitorSessionId"];

                if (accessToken != null && refreshToken != null && visitorSessionUUID != null)
                {
                    // Decode the access token to get the payload
                    var accessTokenPayload = TokenUtils.DecodeAccessToken(accessToken);

                    // Convert the UserId to an integer
                    int loggedInUserId = int.Parse(accessTokenPayload["UserId"].ToString());

                    // Inactivate the visitor session asynchronously using VisitorSessionUtils instance
                    bool isSessionInactivated = await _visitorSessionUtils.InactivateVisitorSessionAsync(visitorSessionUUID, loggedInUserId, accessToken);

                    if (!isSessionInactivated)
                    {
                        return BadRequest("Failed to inactivate visitor session.");
                    }

                    bool isTokenRevoked = TokenUtils.RevokeTheToken(refreshToken, accessToken);

                    if (isTokenRevoked)
                    {
                        // Remove cookies
                        Response.Cookies.Delete("IsLoggedIn");
                        Response.Cookies.Delete("accessToken"); 
                        Response.Cookies.Delete("refreshToken");
                        Response.Cookies.Delete("VisitorSessionId");
                        Response.Cookies.Delete("VisitorSessionUUID");
                        Response.Cookies.Delete("UpdateUserIdentity");

                        // Redirect to root URL
                        return Ok("Successfully Logged Out, revoked tokens, and inactivated visitor session.");
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

        [HttpGet]
        public async Task<IActionResult> ProcessVisitorSession()
        {
            var visitorSessionUUID = Request.Cookies["VisitorSessionUUID"];
            var accessTokenFromCookie = Request.Cookies["accessToken"];

            if (accessTokenFromCookie == null)
            {
                return BadRequest(new { success = false, message = "Access token not found in cookies." });
            }

            var accessTokenUser = TokenUtils.DecodeAccessToken(accessTokenFromCookie);

            if (!string.IsNullOrEmpty(visitorSessionUUID))
            {
                var userId = int.Parse(accessTokenUser["UserId"].ToString());
                var updateResult = await _visitorSessionUtils.UpdateUserIdByVisitorSessionUUIDAsync(visitorSessionUUID, userId, accessTokenFromCookie);

                if (!updateResult)
                {
                    return BadRequest(new { success = false, message = "Failed to update UserId for visitor session." });
                }
            }

            return Ok(new { success = true });
        }

    }
}
