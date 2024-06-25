namespace Startup_Gateway_Website.Models.Request
{
    public class VisitorSessionRequest
    {
        public string? Browser { get; set; }
        public string? OS { get; set; }
        public string? CPU { get; set; }
        public string? Device { get; set; }
        public int? UserId { get; set; }
        public string? OriginUrl { get; set; }
        public string? CurrentUrl { get; set; }
    }

}
