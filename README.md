##### todo

- gmail 请求邮件代理配置(已完成但是刷新 token 时理论上还是用的本地 ip)
- 热更新
- 修改应用标题图标,修改安装界面(done)
- 备份数据库(?导出数据加密?)
- 兼容 sui 脚本,通过后端 api 调用
- 基础登录功能

##### V0.1.11

- 新增查排名功能（自用）

##### V0.1.10

- 新增轮盘抓赌狗
- 新增 suiQuest 查排名功能
- 新增 suiQuest 导入导出数据功能
- 接入分水 & 集水

##### V0.1.9

- 新增轮盘检测系统

##### V0.1.8

- 更新 over 批量运行功能,由串行请求改为并行请求,目前并行请求数量为 5
- 代码结构调整: 后端路由注册逻辑优化

##### V0.1.7

- 更新 over 请求版本号
- 新增 over 账号状态颜色

##### V0.1.6

- 系统设置:新增导出导入数据库功能
- 修复 gmail 批量导入时顺序错乱的问题
- 修复登录 over 账号时偶现的一些报错
- OTC

##### V0.1.5

- over: 新增代理功能,关联邮箱代理
- over: 新增批量按序领分答题功能
- over: 账户编辑功能失效的问题
- 前端: 新增黑夜模式

##### V0.1.4

- over:新增排行字段

##### V0.1.3

- over:优化样式,显示当前分数和上次分数

##### V0.1.2

- 修改 gmail 服务超时时间
- 修改 gmail 服务请求 contentLength 最大值为 10m
- 新增 log 信息，gmail 和 over 服务的 log 可以在日志页面看到
- 新增版本更新自动更新数据库功能

##### V0.1.1

- 新增基础 gmail 服务
- 新增基础 over 服务,可领分注册答题
- 新增 express 后端服务
- 新增 nedb 数据库
- 新增打包自定义目录功能
- 暂不兼容 sui 脚本

##### V0.1.0

- 基础 sui 领分分号功能
