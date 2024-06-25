using Azure;
using Newtonsoft.Json.Linq;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using Azure.Core;
using log4net;
using System.Net.Http.Headers;

namespace Startup_Gateway_Website.Utils
{
    public static class TokenUtils
    {
        private static readonly ILog _logger = LogManager.GetLogger(typeof(TokenUtils));

        public static JObject DecodeAccessToken(string accessToken)
        {
            if (string.IsNullOrEmpty(accessToken))
            {
                return null;
            }

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var token = handler.ReadJwtToken(accessToken);
                return JObject.Parse(token.Payload.SerializeToJson());
            }
            catch (Exception ex)
            {
                // Log error
                _logger.Error("Error decoding access token", ex);

                var errorPayload = new JObject();
                errorPayload["error"] = "Error decoding access token: " + ex.Message;
                return errorPayload;
            }
        }

        public static string GetNewAccessToken(string refreshToken)
        {
            using (var client = new HttpClient())
            {
                try
                {
                    // Set the base URL of the API
                    client.BaseAddress = new Uri(GlobalVariables.ApiUrl);

                    // Prepare the JSON request body
                    var json = $"\"{refreshToken}\"";
                    var content = new StringContent(json, Encoding.UTF8, "application/json");

                    // Make a POST request to the RefreshToken endpoint
                    var response = client.PostAsync("Access/RefreshToken", content).Result;

                    // Check if the request was successful
                    if (response.IsSuccessStatusCode)
                    {
                        // Read the response content
                        var accessToken = response.Content.ReadAsStringAsync().Result;

                        // Log successful token retrieval
                        _logger.Info("New access token retrieved successfully");

                        return accessToken;
                    }
                    else
                    {
                        // Log HTTP error status
                        _logger.Error($"Failed to get new access token. Status code: {response.StatusCode}");

                        return null;
                        // Throw an exception or handle the error accordingly
                        //throw new HttpRequestException($"Failed to get new access token. Status code: {response.StatusCode}");
                    }
                }
                catch (Exception ex)
                {
                    // Log exception
                    _logger.Error("Exception occurred while getting new access token", ex);

                    // Re-throw the exception to propagate it further
                    throw;
                }
            }
        }


        /// <summary>
        /// Doing a Logout (revoke a token)
        /// </summary>
        /// <param name="refreshToken"></param>
        /// <returns></returns>
        public static bool RevokeTheToken(string refreshToken, string accessToken)
        {
            using (var client = new HttpClient())
            {
                try
                {
                    // Set the base URL of the API
                    client.BaseAddress = new Uri(GlobalVariables.ApiUrl);

                    var json = $"\"{refreshToken}\"";
                    // Prepare the JSON request body
                    var content = new StringContent(json, Encoding.UTF8, "application/json");

                    // Add access token to the request headers
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                    // Make a POST request to the RevokeToken endpoint
                    var response = client.PostAsync("Access/RevokeToken", content).Result;

                    // Check if the request was successful
                    if (response.IsSuccessStatusCode)
                    {
                        // Log successful token revocation
                        _logger.Info("Token revoked successfully");

                        return true;
                    }
                    else
                    {
                        // Log HTTP error status
                        _logger.Error($"Failed to revoke token. Status code: {response.StatusCode}");

                        return false;
                        // Throw an exception or handle the error accordingly
                        //throw new HttpRequestException($"Failed to revoke token. Status code: {response.StatusCode}");
                    }
                }
                catch (Exception ex)
                {
                    // Log exception
                    _logger.Error("Exception occurred while revoking token", ex);

                    // Re-throw the exception to propagate it further
                    throw;
                }
            }
        }

       
    }
}
