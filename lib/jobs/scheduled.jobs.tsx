import SyncLiveTimeEventsJob from '@/lib/jobs/sync.livetimerc.events.job';
import { RunnableJob } from '@/lib/jobs/runnable.job';
import Logger from '@/lib/utils/logger';

export default class ScheduledJobs {
    static logger: Logger = new Logger('ScheduledJobs');

    private static jobs = [
        new RunnableJob("sync_livetimerc_content", SyncLiveTimeEventsJob),
    ]

    private static lastSyncStartTime: number = 0;
    private static lastSyncEndTime: number = 0;
    private static lastSyncIndex: number = -1;
    private static jobsRun: number = 0;

    private static DEFAULT_SYNC_INTERVAL_MS: number = 30 * 60 * 1000; // 30 minutes

    static getJobs(): RunnableJob[] {
        return ScheduledJobs.jobs;
    }

    static async startProgressiveJobRuns() {
        let numJobs = ScheduledJobs.getJobs().length;
        let interval = ScheduledJobs.DEFAULT_SYNC_INTERVAL_MS;

        if (numJobs === 0) return;
        ScheduledJobs.logger.info(`Starting progressive job sync for ${numJobs} job(s) every ${interval / 1000} seconds.`);

        //We will run the job every DEFAULT_SYNC_INTERVAL_MS
        // BUT, we want the job to start running at the next interval boundary
        //  So, if we run every 15 minutes, and it's currently 10:07, we want to start at 10:15
        let now = Date.now();
        let timeSinceLastInterval = now % interval;
        let timeUntilNextInterval = interval - timeSinceLastInterval;
        ScheduledJobs.logger.info(`First scheduled job run will start in ${timeUntilNextInterval / 1000} seconds.`);
        ScheduledJobs.logger.info(`Running first job now.`);

        this.runNextJob();
        //Set a timeout to start at the next interval boundary
        setTimeout(async () => {
            await this.runNextJob();
            setInterval(async () => {
                await this.runNextJob();
            }, interval);
        }, timeUntilNextInterval);
    }

    static getNextJob(): RunnableJob | null {
        let jobs = ScheduledJobs.getJobs();
        if (this.lastSyncIndex < 0 || this.lastSyncIndex >= jobs.length) {
            this.lastSyncIndex = 0;
        }
        return jobs[this.lastSyncIndex];
    }

    private static onNoJobToRun() {
        ScheduledJobs.logger.info("No job to run for progressive sync step.");
    }

    private static onJobRunStarted(job?: RunnableJob) {
        ScheduledJobs.lastSyncStartTime = Date.now();
        ScheduledJobs.logger.info(`Starting job run #${this.jobsRun + 1} for job: ${job?.name}`);
    }

    private static onJobRunComplete(job?: RunnableJob) {
        this.lastSyncIndex++;
        this.jobsRun++;
        ScheduledJobs.lastSyncEndTime = Date.now();
        let jobDuration = ScheduledJobs.lastSyncEndTime - ScheduledJobs.lastSyncStartTime;
        ScheduledJobs.logger.info(`Completed job run #${this.jobsRun} for job: ${job?.name} in ${jobDuration / 1000} seconds.`);
    }

    static async runNextJob() {
        const job = ScheduledJobs.getNextJob();
        if (!job) ScheduledJobs.onNoJobToRun();
        else {
            ScheduledJobs.onJobRunStarted(job);
            await job.run();
            ScheduledJobs.onJobRunComplete(job);
        }
    }
}