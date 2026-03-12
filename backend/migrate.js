const mongoose = require('mongoose');
const Report = require('./models/Report');
const { Thread } = require('./models/Thread');
const SLA = require('./models/SLA');
const WorkflowEvent = require('./models/WorkflowEvent');

async function migrate() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-reports';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    
    const reports = await Report.find({});
    console.log(`📊 Found ${reports.length} reports to migrate`);
    
    let threadsCreated = 0;
    let slasCreated = 0;
    let eventsCreated = 0;
    
    for (const report of reports) {
      // Create thread if not exists
      const existingThread = await Thread.findOne({ reportId: report._id });
      if (!existingThread) {
        await new Thread({
          reportId: report._id,
          participantIds: [report.reportedBy],
          lastMessageAt: report.createdAt
        }).save();
        threadsCreated++;
      }
      
      // Create SLA if not exists
      const existingSLA = await SLA.findOne({ reportId: report._id });
      if (!existingSLA) {
        const created = new Date(report.createdAt);
        await new SLA({
          reportId: report._id,
          acknowledgeDeadline: new Date(created.getTime() + 24 * 60 * 60 * 1000),
          resolutionDeadline: new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000),
          acknowledgedAt: report.acknowledgedAt,
          resolvedAt: report.resolvedAt,
          slaStatus: report.resolvedAt ? 'on_track' : 'on_track'
        }).save();
        slasCreated++;
      }
      
      // Create initial workflow event if not exists
      const existingEvent = await WorkflowEvent.findOne({ reportId: report._id });
      if (!existingEvent) {
        // Map legacy status to new workflow states
        const statusMap = {
          'pending': 'reported',
          'open': 'reported',
          'in-progress': 'in_progress',
          'resolved': 'resolved',
          'closed': 'closed'
        };
        const mappedStatus = statusMap[report.status] || 'reported';
        
        await new WorkflowEvent({
          reportId: report._id,
          toStatus: mappedStatus,
          performedBy: report.reportedBy,
          notes: 'Initial report submission (migrated)',
          createdAt: report.createdAt
        }).save();
        eventsCreated++;
      }
    }
    
    console.log(`\n✅ Migration Complete!`);
    console.log(`   Threads created: ${threadsCreated}`);
    console.log(`   SLAs created: ${slasCreated}`);
    console.log(`   Workflow events created: ${eventsCreated}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
