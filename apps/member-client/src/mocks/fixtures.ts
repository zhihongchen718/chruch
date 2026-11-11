import type { Church, Group, Member, Notice, Resource } from '../services/contracts'
import { addDays } from '../services/time'

export const church: Church = {
  name: ['恩典教会', 'Grace Church'],
  leader: ['王明牧师', 'Pastor Ming Wang'],
  email: 'pastor@gracechurch.example',
  timezone: 'America/Vancouver',
}

export const member: Member = {
  id: 'demo-member',
  number: 'M-10086',
  name: ['陈雨', 'Rain Chen'],
  gender: ['女', 'Female'],
  birthday: '1994-05-19',
  baptismDate: '2021-06-13',
  role: ['普通会员', 'Member'],
  group: ['Surrey 南区', 'South Surrey'],
}

export const groups: Group[] = [
  {
    id: 'surrey', name: ['Surrey 南区', 'South Surrey'], area: 'Surrey',
    venue: ['南区社区活动室', 'South Surrey community room'],
    leader: ['陈大卫', 'David Chen'], reading: ['约翰福音 1–5 章', 'John 1–5'], visibility: 'public',
  },
  {
    id: 'richmond', name: ['Richmond 列治文', 'Richmond Fellowship'], area: 'Richmond',
    venue: ['列治文团契室', 'Richmond fellowship room'],
    leader: ['李欣', 'Grace Li'], reading: ['罗马书 1–8 章', 'Romans 1–8'], visibility: 'public',
  },
  {
    id: 'white-rock', name: ['White Rock 白石', 'White Rock Fellowship'], area: 'White Rock',
    venue: ['白石社区活动室', 'White Rock community room'],
    leader: ['黄迈克', 'Michael Wong'], reading: ['诗篇 1–30 篇', 'Psalms 1–30'], visibility: 'members',
  },
]

export function makeNotices(today: string): Notice[] {
  return [
    {
      id: 'sermon-grace', category: 'sermon', title: ['讲道预告', 'Upcoming sermon'],
      summary: ['在恩典中成长 · 王明牧师', 'Growing in Grace · Pastor Ming Wang'],
      body: ['本周崇拜将由王明牧师分享「在恩典中成长」。欢迎提前十分钟到主礼堂，一起安静预备。', 'This week Pastor Ming Wang will share “Growing in Grace.” Come to the main sanctuary ten minutes early for a quiet moment before worship.'],
      publishedOn: today, visibility: 'public',
    },
    {
      id: 'youth-night', category: 'youth', title: ['青年活动', 'Youth night'],
      summary: ['篮球与团契 · 周五晚上 7 点', 'Basketball & fellowship · Friday at 7 PM'],
      body: ['本周五晚 7 点在团契厅集合。请穿运动鞋并自备水壶，欢迎带朋友参加。', 'Meet in the fellowship hall this Friday at 7 PM. Bring sneakers and a water bottle. Friends are welcome.'],
      publishedOn: today, visibility: 'public',
    },
    {
      id: 'volunteers', category: 'volunteer', title: ['志愿者招募', 'Volunteers wanted'],
      summary: ['儿童主日学邀请三位同工', 'Three helpers needed for Sunday school'],
      body: ['愿意协助课堂布置、签到或手工活动的教友，请在崇拜结束后联系儿童事工同工。', 'Speak with the children’s ministry team after worship if you can help prepare the classroom, welcome families, or run crafts.'],
      publishedOn: addDays(today, -1), visibility: 'public',
    },
    {
      id: 'birthday', category: 'birthdayNotice', title: ['生日祝福', 'Birthday blessings'],
      summary: ['为本周生日的弟兄姐妹祝福', 'Celebrating birthdays this week'],
      body: ['愿本周生日的弟兄姐妹在新的一岁中经历平安和喜乐。', 'We pray for peace and joy for everyone celebrating a birthday this week.'],
      publishedOn: addDays(today, -2), visibility: 'public',
    },
    {
      id: 'prayer-week', category: 'prayer', title: ['本周代祷', 'This week’s prayers'],
      summary: ['为教会与社区献上祷告', 'Pray for the church and our community'],
      body: ['请为正在适应新环境的家庭、准备考试的学生以及社区服侍的志愿者祷告。', 'Pray for families settling into a new community, students preparing for exams, and volunteers serving our neighbours.'],
      publishedOn: today, visibility: 'members',
    },
  ]
}

export const resources: Resource[] = [
  {
    id: 'psalms-audio', testament: 'old', bookId: 'psalms', book: ['诗篇', 'Psalms'], type: 'audio',
    title: ['静心聆听', 'A moment of stillness'],
    description: ['一段为演示制作的器乐音频，可试听播放、暂停和进度控制。', 'An original instrumental clip for trying playback, pause, and seeking.'],
    locale: 'both', visibility: 'public',
  },
  {
    id: 'genesis-text', testament: 'old', bookId: 'genesis', book: ['创世记', 'Genesis'], type: 'text',
    title: ['创世记 1 章导读', 'Reading guide to Genesis 1'],
    description: ['从创造的次序开始读经。', 'Begin with the order of creation.'],
    body: ['读完本章后，回顾经文如何描述光、土地和生命的出现。小组可以分享：反复出现的描述带给你怎样的感受？', 'After reading the chapter, consider how it describes the appearance of light, land, and life. Discuss what the recurring phrases bring to mind.'],
    locale: 'both', visibility: 'public',
  },
  {
    id: 'psalms-text', testament: 'old', bookId: 'psalms', book: ['诗篇', 'Psalms'], type: 'text',
    title: ['诗篇 23 篇读经笔记', 'Reading notes on Psalm 23'],
    description: ['一起思想牧者与同行的意象。', 'Reflect on the images of the shepherd and companionship.'],
    body: ['读完诗篇 23 篇后，选一个你印象最深的画面。想想它如何帮助你理解信靠。', 'After reading Psalm 23, choose an image that stays with you. Consider what it tells you about trust.'],
    locale: 'both', visibility: 'public',
  },
  {
    id: 'john-text', testament: 'new', bookId: 'john', book: ['约翰福音', 'John'], type: 'text',
    title: ['约翰福音 1 章小组讨论', 'Group discussion on John 1'],
    description: ['阅读序言并讨论「光」的意象。', 'Read the prologue and discuss its image of light.'],
    body: ['本周先读约翰福音 1 章。留意作者如何用光来描述生命。小组聚会时，可分享这一章中让你愿意再次阅读的段落。', 'Read John 1 this week. Notice how the writer uses light to describe life. At your group meeting, share a passage from the chapter you’d like to revisit.'],
    locale: 'both', visibility: 'public',
  },
  {
    id: 'romans-testimony', testament: 'new', bookId: 'romans', book: ['罗马书', 'Romans'], type: 'testimony',
    title: ['在团契中学会盼望', 'Learning hope in fellowship'],
    description: ['一篇关于同行与鼓励的虚构见证。', 'A fictional testimony about companionship and encouragement.'],
    body: ['刚搬到新城市时，我对一切都很陌生。小组的一顿饭和一次耐心的倾听，让我开始愿意向人开口，也慢慢找到了可以同行的朋友。', 'When I first moved to a new city, everything felt unfamiliar. A meal with the group and someone who took the time to listen helped me open up and find friends to walk with.'],
    locale: 'both', visibility: 'members',
  },
]
