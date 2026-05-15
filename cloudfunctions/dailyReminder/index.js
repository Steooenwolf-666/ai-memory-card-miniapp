// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  const $ = db.command.aggregate
  
  try {
    // 获取今天需要复习的卡片
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const cardsToReview = await db.collection('cards')
      .where({
        nextReviewDate: _.lte(today)
      })
      .get()
    
    // 获取订阅了提醒的用户
    const users = await db.collection('users')
      .where({
        subscriptionStatus: true
      })
      .get()
    
    // 发送订阅消息
    const sendPromises = users.data.map(async user => {
      const userCards = cardsToReview.data.filter(card => card._openid === user._openid)
      
      if (userCards.length > 0) {
        try {
          await cloud.openapi.subscribeMessage.send({
            touser: user._openid,
            templateId: 'your-template-id', // 替换为你的订阅消息模板ID
            data: {
              thing1: {
                value: '记忆卡片复习提醒'
              },
              date2: {
                value: today.toLocaleDateString()
              },
              time3: {
                value: '今日待复习卡片：' + userCards.length + '张'
              }
            }
          })
        } catch (err) {
          console.error('发送订阅消息失败：', err)
        }
      }
    })
    
    await Promise.all(sendPromises)
    
    return {
      success: true,
      message: '提醒发送成功'
    }
  } catch (err) {
    console.error('执行失败：', err)
    return {
      success: false,
      error: err
    }
  }
} 