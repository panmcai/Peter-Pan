# 大家好，我是Peter·Pan，一个专注于高性能编程的软件工程师
下面是我的简单介绍：
- 精通C++编程，泛型编程，多线程编程以及常见设计模式等C++编程技术
- 精通Makefile,Cmake,GTest，Pytest，GDB等常用开发工具
- 精通python语言，熟悉pytorch与numpy等常见Python库的使用
- 精通CUDA编程，熟悉llvm编译器，精度CUDA TCore编程算法，例如GEMM,Flash Attention等
- All In AI, 习惯使用AI Agent协助开发，提升效率

# 技术分享：
[CSDN @ Peter·Pan爱编程](https://blog.csdn.net/weixin_42125125?spm=1000.2115.3001.5343) | [个人网站](http://peter.panmcai.dpdns.org/)

# 免费工具推荐
[FloatVisualizer](https://panmcai.github.io/FloatVisualizer/)

# 技术框架
- 聊天：DeepSeek（默认）/ 智谱AI glm-4.7-flash（备选）
- 文生图：智谱AI CogView-3-Flash
- 文生视频：CogVideoX-Flash
- TTS：Edge-TTS

# 环境配置
1. 在 `.env.local` 中配置 DeepSeek API Key（推荐）：
   - 从 https://platform.deepseek.com/ 获取 API Key
   - 设置 `DEEPSEEK_API_KEY=your_deepseek_api_key_here`

2. 或者配置智谱AI API Key（备选）：
   - 从 https://open.bigmodel.cn/ 获取 API Key
   - 设置 `ZHIPUAI_API_KEY=your_zhipuai_api_key_here`

3. 安装依赖：
```bash
pnpm install
```

4. 启动开发服务器：
```bash
pnpm dev
```
