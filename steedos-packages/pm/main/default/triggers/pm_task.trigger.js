module.exports = {
  listenTo: 'pm_task',

  beforeInsert: async function () {
    const doc = this.doc;
    if (doc.start_date && doc.due_date && new Date(doc.due_date) < new Date(doc.start_date)) {
      throw new Error('截止日期不能早于开始日期');
    }
  },

  beforeUpdate: async function () {
    const doc = this.doc;
    if (doc.start_date && doc.due_date && new Date(doc.due_date) < new Date(doc.start_date)) {
      throw new Error('截止日期不能早于开始日期');
    }
  },

  afterUpdate: async function () {
    const doc = this.doc;
    const previous = this.previousDoc;
    // 任务变为 completed 时，检查所属里程碑下所有任务是否全部完成
    if (doc.status === 'completed' && previous && previous.status !== 'completed' && doc.milestone) {
      const taskObj = this.getObject('pm_task');
      const siblings = await taskObj.find({
        filters: [['milestone', '=', doc.milestone]],
        fields: ['_id', 'status']
      });
      const allDone = siblings.every(t => t.status === 'completed' || t.status === 'cancelled');
      if (allDone && siblings.length > 0) {
        const milestoneObj = this.getObject('pm_milestone');
        await milestoneObj.directUpdate(doc.milestone, { status: 'completed' });
      }
    }
  }
};
