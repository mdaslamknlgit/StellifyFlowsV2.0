using Quartz;
using Quartz.Impl;
using System;
using System.Threading.Tasks;

namespace UELPM.Scheduler
{

    public class JobScheduler
    {

        //IScheduler.IsStarted property
        //This only reflects whether Start() has ever been called on this Scheduler, so it will return true even if the IScheduler is currently 
        //in standby mode or has been since shutdown.

        //Maybe you should check property IsShutdown and InStandbyMode.

        public static async Task Start()
        {
            try
            {
                StdSchedulerFactory factory = new StdSchedulerFactory();
                IScheduler scheduler = await factory.GetScheduler();
                string pocCronExp = string.Empty;
                // #region Users Sync from Active Directory              

                // // string userCronExp = "0 0/5 * 1/1 * ? *";  //default every day 6AM             

                // // IScheduler UserScheduler = await factory.GetScheduler();
                // // IJobDetail UserJobDetail = JobBuilder.Create<UserSyncJob>()
                // //.WithIdentity("UserSyncTrigger")
                // //.Build();
                // // ITrigger userTrigger = TriggerBuilder.Create()
                // //     .ForJob(UserJobDetail)
                // //     .WithCronSchedule(userCronExp)
                // //     //.WithSchedule(CronScheduleBuilder.DailyAtHourAndMinute(20, 30))  // daily at 10.30 pm
                // //     .WithIdentity("UserSyncTrigger")
                // //     //.StartNow()
                // //     .Build();

                // // await UserScheduler.ScheduleJob(UserJobDetail, userTrigger);
                // // await UserScheduler.Start();                  


                // #endregion

                #region POC Generation sync        

                //pocCronExp = "0 0/1 * 1/1 * ? *";  //default every 3 min   

                //pocCronExp = "0 2 * * *";   //every day at 2am 

                //pocCronExp = "0 */2 * * *";   //every 2nd hour

                //pocCronExp = "0 0 13 * * ? *";

                //string pocCronExp = "0 0 * * *";

                //string pocCronExp = "0 0 12 * * ?""  //Fire at 12pm (noon) every day

                // IScheduler POCGenrateScheduler = await factory.GetScheduler();
                //IJobDetail POCGenrateJobDetail = JobBuilder.Create<POCGenerateJob>()
               //.WithIdentity("POCGenerateSyncTrigger")
               //.Build();
               // ITrigger pocTrigger = TriggerBuilder.Create()
               //     .ForJob(POCGenrateJobDetail)
               //     .WithCronSchedule(pocCronExp)
               //     //.WithSchedule(CronScheduleBuilder.DailyAtHourAndMinute(11, 58)) // daily at 10.30 pm
               //     .WithIdentity("POCGenerateSyncTrigger")
               //     //.StartNow()
               //     .Build();

                // await POCGenrateScheduler.ScheduleJob(POCGenrateJobDetail, pocTrigger);
                // await POCGenrateScheduler.Start();

                #endregion

                await scheduler.Start();
            }
            catch (JobExecutionException exp)
            {              
                var MessageError = exp.ToString();             

            }
        }

        public static async Task ShutDown()
        {
            try
            {
                StdSchedulerFactory factory = new StdSchedulerFactory();
                IScheduler scheduler = await factory.GetScheduler();

                // and start it off
                if (scheduler.IsStarted)
                {
                    await scheduler.Shutdown();
                }
            }
            catch (JobExecutionException exp)
            {
                var MessageError = exp.ToString();
            }
        }

        public static async Task Stop()
        {
            try
            {
                StdSchedulerFactory factory = new StdSchedulerFactory();
                IScheduler scheduler = await factory.GetScheduler();

                // and start it off
                if (scheduler.IsStarted)
                {
                    await scheduler.PauseAll();
                }
            }
            catch (JobExecutionException exp)
            {
                var MessageError = exp.ToString();
            }
        }

        public static bool AddJobs(string JobName, string CronOptions)
        {
            Boolean ReturnValue = true;

            try
            {
                return ReturnValue;
            }
            catch (Exception exp)
            {

                ReturnValue = false;
            }
            return ReturnValue;
        } 
    }
}
