using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace EnvanzoPrintService
{
    class Program
    {
        static void Main(string[] args)
        {
            var builder = Host.CreateApplicationBuilder(args);
            
            builder.Services.AddWindowsService(options =>
            {
                options.ServiceName = "Envanzo Print Service";
            });
            
            builder.Services.AddHostedService<PrintWorker>();

            var host = builder.Build();
            host.Run();
        }
    }
}
