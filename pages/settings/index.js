const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    subscribed: false,
    loading: true
  },

  onLoad: async function() {
    // 获取用户订阅状态
    try {
      const userRes = await db.collection('users').where({}).get();
      
      this.setData({
        subscribed: userRes.data[0]?.subscriptionStatus || false,
        loading: false
      });
    } catch (err) {
      console.error('获取订阅状态失败：', err);
      this.setData({ loading: false });
    }
  },

  async handleSubscribe() {
    try {
      // 请求订阅消息权限
      const tmplId = 'your-template-id'; // 替换为你的模板ID
      const res = await wx.requestSubscribeMessage({
        tmplIds: [tmplId]
      });

      if (res[tmplId] === 'accept') {
        // 用户同意订阅
        await this.updateSubscriptionStatus(true);
        wx.showToast({
          title: '订阅成功',
          icon: 'success'
        });
      } else {
        // 用户拒绝订阅
        wx.showToast({
          title: '订阅失败',
          icon: 'none'
        });
      }
    } catch (err) {
      console.error('订阅失败：', err);
      wx.showToast({
        title: '订阅失败',
        icon: 'none'
      });
    }
  },

  async handleUnsubscribe() {
    try {
      await this.updateSubscriptionStatus(false);
      wx.showToast({
        title: '取消订阅成功',
        icon: 'success'
      });
    } catch (err) {
      console.error('取消订阅失败：', err);
      wx.showToast({
        title: '取消订阅失败',
        icon: 'none'
      });
    }
  },

  async updateSubscriptionStatus(status) {
    try {
      const userRes = await db.collection('users').where({}).get();

      if (userRes.data.length === 0) {
        // 创建新用户记录
        await db.collection('users').add({
          data: {
            subscriptionStatus: status,
            createTime: db.serverDate()
          }
        });
      } else {
        // 更新现有用户记录
        await db.collection('users').doc(userRes.data[0]._id).update({
          data: {
            subscriptionStatus: status,
            updateTime: db.serverDate()
          }
        });
      }

      this.setData({ subscribed: status });
    } catch (err) {
      console.error('更新订阅状态失败：', err);
      throw err;
    }
  }
}); 