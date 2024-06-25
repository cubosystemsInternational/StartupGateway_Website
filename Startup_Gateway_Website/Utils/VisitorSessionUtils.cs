using Startup_Gateway_Website.Models.Request;
using Startup_Gateway_Website.Models.Response;
using System.Net.Http.Headers;
using Umbraco.Cms.Core.Models.Membership;

namespace Startup_Gateway_Website.Utils
{
    public class VisitorSessionUtils
    {
        private readonly IHttpClientFactory _clientFactory;
        private readonly ILogger<VisitorSessionUtils> _logger;

        public VisitorSessionUtils(IHttpClientFactory clientFactory, ILogger<VisitorSessionUtils> logger)
        {
            _clientFactory = clientFactory;
            _logger = logger;
        }

        public async Task<VisitorSessionResponse> CreateSessionAsync(VisitorSessionRequest request, string ip)
        {
            //var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
            var session = new
            {
                IpAddress = ip,
                Browser = request.Browser,
                OS = request.OS,
                CPU = request.CPU,
                Device = request.Device,
                UserId = request.UserId == 0 ? (int?)null : request.UserId,
                Status = 0,
                ModifiedOn = DateTime.UtcNow,
                ModifiedBy = request.UserId == 0 ? (int?)null : request.UserId
            };

            var client = _clientFactory.CreateClient();
            var response = await client.PostAsJsonAsync(GlobalVariables.ApiUrl + "VisitorSession/InsertVisitorSession", session);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<VisitorSessionResponse>();
        }

        public async Task TrackSessionActivityAsync(string? OriginUrl, string? CurrentUrl, int? userId, int visitorSessionId)
        {
            int visitorId = visitorSessionId;
            //int.Parse(request.Cookies["VisitorSessionId"]);
            var trackSession = new
            {
                VisitorId = visitorId,
                DatetimeUtc = DateTime.UtcNow,
                DateTimeLK = DateTime.UtcNow,
                OriginUrl = OriginUrl,
                CurrentUrl = CurrentUrl,
                Status = 0,
                ModifiedOn = DateTime.UtcNow,
                ModifiedBy = userId == 0 ? (int?)null : userId

            };

            var trackingClient = _clientFactory.CreateClient();
            var trackingResponse = await trackingClient.PostAsJsonAsync(GlobalVariables.ApiUrl + "VisitorSession/AddVisitorSessionTracking", trackSession);
            trackingResponse.EnsureSuccessStatusCode();
        }


        public async Task<bool> InactivateVisitorSessionAsync(string visitorSessionUUID, int userId, string accessToken)
        {
            using (var client = new HttpClient())
            {
                try
                {
                    client.BaseAddress = new Uri(GlobalVariables.ApiUrl);
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                    var response = await client.PutAsync($"VisitorSession/InactivateVisitorSession?visitorSessionUUID={visitorSessionUUID}&UserId={userId}", null);

                    if (response.IsSuccessStatusCode)
                    {
                        _logger.LogInformation("Visitor session inactivated successfully");
                        return true;
                    }
                    else
                    {
                        _logger.LogError($"Failed to inactivate visitor session. Status code: {response.StatusCode}");
                        return false;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError("Exception occurred while inactivating visitor session", ex);
                    throw; // Propagate the exception further
                }
            }
        }

        /// <summary>
        /// Update User Id when loggedIn for the Visitor Session
        /// </summary>
        /// <param name="visitorSessionUUID"></param>
        /// <param name="newUserId"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public async Task<bool> UpdateUserIdByVisitorSessionUUIDAsync(string visitorSessionUUID, int newUserId, string accessToken)
        {
            using (var client = _clientFactory.CreateClient())
            {
                try
                {
                    // Set the base URL of the API
                    client.BaseAddress = new Uri(GlobalVariables.ApiUrl);

                    // Add access token to the request headers
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                    // Make a PUT request to the UpdateUserIdByVisitorSessionUUID endpoint
                    var response = await client.PutAsync($"{GlobalVariables.ApiUrl}VisitorSession/UpdateUserIdByVisitorSessionUUID?visitorSessionUUID={visitorSessionUUID}&newUserId={newUserId}", null);

                    // Check if the request was successful
                    if (response.IsSuccessStatusCode)
                    {
                        // Log successful update
                        _logger.LogInformation("UserId updated successfully for visitor session.");

                        return true;
                    }
                    else
                    {
                        // Log HTTP error status
                        _logger.LogError($"Failed to update UserId for visitor session. Status code: {response.StatusCode}");

                        return false;
                    }
                }
                catch (Exception ex)
                {
                    // Log exception
                    _logger.LogError("Exception occurred while updating UserId for visitor session", ex);

                    // Re-throw the exception to propagate it further
                    throw;
                }
            }
        }
    }

}
