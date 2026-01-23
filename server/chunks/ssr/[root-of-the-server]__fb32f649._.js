module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},50645,a=>{a.n(a.i(27572))},7991,a=>{a.n(a.i(30355))},99354,a=>{a.n(a.i(26644))},53122,a=>{a.n(a.i(56936))},76872,a=>{a.n(a.i(23808))},7887,(a,b,c)=>{let{createClientModuleProxy:d}=a.r(39654);a.n(d("[project]/node_modules/.pnpm/next@16.0.10_@babel+core@7.28.6_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/dist/client/app-dir/link.js <module evaluation>"))},83284,(a,b,c)=>{let{createClientModuleProxy:d}=a.r(39654);a.n(d("[project]/node_modules/.pnpm/next@16.0.10_@babel+core@7.28.6_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/dist/client/app-dir/link.js"))},19102,a=>{"use strict";a.i(7887);var b=a.i(83284);a.n(b)},44144,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={default:function(){return i},useLinkStatus:function(){return h.useLinkStatus}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(54508),g=a.r(49616),h=f._(a.r(19102));function i(a){let b=a.legacyBehavior,c="string"==typeof a.children||"number"==typeof a.children||"string"==typeof a.children?.type,d=a.children?.type?.$$typeof===Symbol.for("react.client.reference");return!b||c||d||(a.children?.type?.$$typeof===Symbol.for("react.lazy")?console.error("Using a Lazy Component as a direct child of `<Link legacyBehavior>` from a Server Component is not supported. If you need legacyBehavior, wrap your Lazy Component in a Client Component that renders the Link's `<a>` tag."):console.error("Using a Server Component as a direct child of `<Link legacyBehavior>` is not supported. If you need legacyBehavior, wrap your Server Component in a Client Component that renders the Link's `<a>` tag.")),(0,g.jsx)(h.default,{...a})}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},37697,50404,13172,13681,a=>{"use strict";var b=a.i(85049);let c=a=>{let b=a.replace(/^([A-Z])|[\s-_]+(\w)/g,(a,b,c)=>c?c.toUpperCase():b.toLowerCase());return b.charAt(0).toUpperCase()+b.slice(1)},d=(...a)=>a.filter((a,b,c)=>!!a&&""!==a.trim()&&c.indexOf(a)===b).join(" ").trim();var e={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let f=(0,b.forwardRef)(({color:a="currentColor",size:c=24,strokeWidth:f=2,absoluteStrokeWidth:g,className:h="",children:i,iconNode:j,...k},l)=>(0,b.createElement)("svg",{ref:l,...e,width:c,height:c,stroke:a,strokeWidth:g?24*Number(f)/Number(c):f,className:d("lucide",h),...!i&&!(a=>{for(let b in a)if(b.startsWith("aria-")||"role"===b||"title"===b)return!0})(k)&&{"aria-hidden":"true"},...k},[...j.map(([a,c])=>(0,b.createElement)(a,c)),...Array.isArray(i)?i:[i]])),g=(a,e)=>{let g=(0,b.forwardRef)(({className:g,...h},i)=>(0,b.createElement)(f,{ref:i,iconNode:e,className:d(`lucide-${c(a).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${a}`,g),...h}));return g.displayName=c(a),g};a.s(["default",()=>g],50404);let h=g("calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);a.s(["Calendar",()=>h],37697);let i=g("clock",[["path",{d:"M12 6v6l4 2",key:"mmk7yg"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);a.s(["Clock",()=>i],13172);let j=[{slug:"python-memory-management",title:"深入理解Python内存管理机制",description:"探索Python的内存分配、垃圾回收和引用计数机制，以及如何优化内存使用",date:"2025-01-15",readTime:"12 分钟",category:"Python",tags:["Python","内存管理","性能优化"],content:`# 深入理解Python内存管理机制

## 引言

Python作为一门高级编程语言，其内存管理机制对开发者来说通常是透明的。然而，深入理解内存管理对于编写高性能、无内存泄漏的应用程序至关重要。

## 引用计数

Python使用**引用计数**作为主要的内存管理机制。每个对象都有一个引用计数器，当计数器降为零时，对象会被自动回收。

\`\`\`python
import sys

a = []
print(sys.getrefcount(a))  # 输出: 2 (一个来自a，一个来自getrefcount的参数)

b = a
print(sys.getrefcount(a))  # 输出: 3

del b
print(sys.getrefcount(a))  # 输出: 2
\`\`\`

### 引用计数的问题

引用计数虽然简单高效，但有一个致命缺陷：无法处理**循环引用**。

\`\`\`python
class Node:
    def __init__(self):
        self.data = []
        self.next = None

a = Node()
b = Node()
a.next = b
b.next = a

# 即使删除a和b，这两个对象仍然无法被回收
\`\`\`

## 垃圾回收

为了解决循环引用问题，Python引入了**分代垃圾回收**机制。

### 三代回收策略

1. **Generation 0**: 新创建的对象
2. **Generation 1**: 存活过一次GC的对象
3. **Generation 2**: 存活过多次GC的对象

\`\`\`python
import gc

# 手动触发垃圾回收
gc.collect()

# 查看回收统计信息
print(gc.get_stats())
\`\`\`

## 内存池机制

Python为了优化小对象的分配，实现了**内存池**机制。

### 小整数缓存

\`\`\`python
a = 256
b = 256
print(a is b)  # True

a = 257
b = 257
print(a is b)  # False (某些情况下可能为True，取决于Python实现)
\`\`\`

### 字符串驻留

\`\`\`python
a = "hello"
b = "hello"
print(a is b)  # True

a = "hello world"
b = "hello world"
print(a is b)  # False
\`\`\`

## 内存优化技巧

### 1. 使用生成器

\`\`\`python
# 列表 - 占用大量内存
def get_numbers_list(n):
    return [i * 2 for i in range(n)]

# 生成器 - 节省内存
def get_numbers_gen(n):
    for i in range(n):
        yield i * 2
\`\`\`

### 2. 使用__slots__

\`\`\`python
class Point:
    __slots__ = ['x', 'y']  # 限制属性，节省内存
    
    def __init__(self, x, y):
        self.x = x
        self.y = y
\`\`\`

### 3. 使用数组而非列表

\`\`\`python
from array import array

# 列表 - 每个元素都是Python对象
numbers_list = [1, 2, 3, 4, 5]

# 数组 - 直接存储C类型值
numbers_array = array('i', [1, 2, 3, 4, 5])
\`\`\`

## 总结

Python的内存管理机制包括：

1. **引用计数** - 主要的内存回收方式
2. **垃圾回收** - 处理循环引用
3. **内存池** - 优化小对象分配

掌握这些机制有助于我们编写更高效的Python程序。

## 参考资料

- [Python官方文档](https://docs.python.org/3/library/gc.html)
- [Python Memory Management](https://realpython.com/python-memory-management/)
`},{slug:"modern-cpp-best-practices",title:"现代C++最佳实践指南",description:"了解C++11/17/20的新特性，掌握现代C++编程的最佳实践",date:"2025-01-10",readTime:"15 分钟",category:"C++",tags:["C++","现代C++","编程实践"],content:`# 现代C++最佳实践指南

## 引言

现代C++（C++11/17/20）引入了许多强大特性，让我们能够编写更安全、更高效的代码。本文将介绍这些新特性以及如何在实际项目中应用它们。

## 智能指针

### unique_ptr

\`unique_ptr\` 是独占所有权的智能指针，当它离开作用域时自动删除对象。

\`\`\`cpp
#include <memory>

std::unique_ptr<int> ptr = std::make_unique<int>(42);

// 转移所有权
std::unique_ptr<int> ptr2 = std::move(ptr);
\`\`\`

### shared_ptr

\`shared_ptr\` 是共享所有权的智能指针，使用引用计数管理对象生命周期。

\`\`\`cpp
#include <memory>

auto ptr = std::make_shared<int>(42);
auto ptr2 = ptr;  // 共享所有权
\`\`\`

### weak_ptr

\`weak_ptr\` 用于观察 \`shared_ptr\`，不增加引用计数，避免循环引用。

\`\`\`cpp
std::weak_ptr<int> weak = ptr;
if (auto shared = weak.lock()) {
    // 使用shared
}
\`\`\`

## Lambda表达式

\`\`\`cpp
auto func = [](int x, int y) { return x + y; };

// 捕获列表
int value = 10;
auto lambda = [value](int x) { return x + value; };
\`\`\`

## auto关键字

\`\`\`cpp
auto x = 42;  // int
auto y = 3.14;  // double
auto z = std::make_unique<int>(42);  // std::unique_ptr<int>
\`\`\`

## 范围for循环

\`\`\`cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

for (const auto& item : vec) {
    std::cout << item << " ";
}
\`\`\`

## 右值引用与移动语义

\`\`\`cpp
std::string str1 = "Hello";
std::string str2 = std::move(str1);  // 移动而非拷贝
\`\`\`

## constexpr

\`\`\`cpp
constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

constexpr int result = factorial(5);  // 编译期计算
\`\`\`

## 总结

现代C++提供了强大的特性：

1. **智能指针** - 自动内存管理
2. **Lambda表达式** - 简洁的匿名函数
3. **auto关键字** - 类型推导
4. **范围for** - 简化的遍历
5. **移动语义** - 性能优化
6. **线程支持** - 并发编程
7. **filesystem** - 文件系统操作
8. **结构化绑定** - 清晰的代码

掌握这些最佳实践将帮助你写出更好的C++代码。
`},{slug:"python-cpp-integration",title:"Python与C++混合编程实战",description:"学习如何使用PyBind11和Cython实现Python与C++的高效集成",date:"2025-01-05",readTime:"18 分钟",category:"Python",tags:["Python","C++","PyBind11","Cython"],content:`# Python与C++混合编程实战

## 引言

在某些高性能场景下，我们需要将Python的易用性与C++的性能优势结合起来。本文将介绍Python与C++混合编程的两种主要方案：PyBind11和Cython。

## PyBind11

PyBind11是一个轻量级的header-only库，用于在Python和C++之间创建绑定。

### 基础示例

\`\`\`cpp
// example.cpp
#include <pybind11/pybind11.h>

int add(int i, int j) {
    return i + j;
}

PYBIND11_MODULE(example, m) {
    m.doc() = "pybind11 example plugin";
    m.def("add", &add, "A function which adds two numbers");
}
\`\`\`

## Cython

Cython是Python的超集，可以将Python代码编译为C扩展。

### 基础示例

\`\`\`cython
# example.pyx
def say_hello(name):
    return f"Hello, {name}!"
\`\`\`

## 性能对比

性能测试结果（处理100万元素）：
- 纯Python: ~200ms
- NumPy: ~5ms
- C++ (PyBind11): ~3ms

## 总结

根据你的具体需求选择合适的方案，在保持Python易用性的同时获得C++的性能优势。
`},{slug:"docker-containerization",title:"Docker容器化部署最佳实践",description:"从零开始学习Docker，掌握容器化应用开发和部署的完整流程",date:"2024-12-28",readTime:"14 分钟",category:"DevOps",tags:["Docker","容器化","部署"],content:`# Docker容器化部署最佳实践

## 引言

Docker已经成为现代应用部署的标准工具。本文将详细介绍Docker的核心概念、常用命令以及生产环境中的最佳实践。

## Docker核心概念

### 镜像（Image）

镜像是一个只读的模板，包含运行应用所需的所有内容：代码、运行时、库、环境变量和配置文件。

### 容器（Container）

容器是镜像的运行实例。可以启动、停止、删除容器，且彼此隔离。

### Dockerfile

Dockerfile是一个文本文件，包含构建Docker镜像的指令。

## Dockerfile最佳实践

### 最小化镜像大小

\`\`\`dockerfile
# ✅ 好：使用Alpine基础镜像
FROM python:3.9-alpine
\`\`\`

### 合并RUN指令

\`\`\`dockerfile
# ✅ 好：合并RUN指令
RUN apt-get update && \\
    apt-get install -y python3 && \\
    apt-get clean && \\
    rm -rf /var/lib/apt/lists/*
\`\`\`

## 生产环境最佳实践

1. **使用非root用户**
2. **健康检查**
3. **资源限制**
4. **定期更新基础镜像**

## 总结

Docker容器化的最佳实践包括：

1. **最小化镜像** - 使用Alpine或精简版基础镜像
2. **优化Dockerfile** - 合并指令、利用缓存、多阶段构建
3. **安全配置** - 非root用户、定期扫描
4. **资源管理** - 设置限制和健康检查
5. **监控日志** - 配置日志收集和监控

掌握这些实践，你就能构建出高效、安全、可维护的容器化应用。
`}];function k(){return j.sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime())}function l(a){return j.find(b=>b.slug===a)||null}function m(){return Array.from(new Set(j.map(a=>a.category))).sort()}a.s(["getAllBlogPosts",()=>k,"getBlogCategories",()=>m,"getBlogPostBySlug",()=>l],13681)},56643,a=>{"use strict";var b=a.i(49616),c=a.i(44144),d=a.i(37697),e=a.i(13172);let f=(0,a.i(50404).default)("tag",[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",key:"vktsd0"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor",key:"kqv944"}]]);var g=a.i(13681);function h(){let a=(0,g.getAllBlogPosts)(),h=["全部",...(0,g.getBlogCategories)()];return(0,b.jsxs)("div",{className:"min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-black dark:via-blue-950/20 dark:to-purple-950/20",children:[(0,b.jsxs)("section",{className:"relative overflow-hidden border-b border-zinc-200 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 px-4 py-20 dark:border-zinc-800",children:[(0,b.jsx)("div",{className:"absolute inset-0 bg-black/10 dark:bg-black/20"}),(0,b.jsx)("div",{className:"absolute inset-0 opacity-20",style:{backgroundImage:"radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)",backgroundSize:"32px 32px"}}),(0,b.jsx)("div",{className:"relative mx-auto max-w-6xl",children:(0,b.jsxs)("div",{className:"text-center",children:[(0,b.jsx)("h1",{className:"mb-4 text-4xl font-bold tracking-tight text-white sm:text-6xl",children:"技术博客"}),(0,b.jsx)("p",{className:"mx-auto max-w-2xl text-lg text-white/90",children:"分享编程知识、技术见解和最佳实践"})]})})]}),(0,b.jsx)("section",{className:"px-4 py-16 sm:px-6 lg:px-8",children:(0,b.jsxs)("div",{className:"mx-auto max-w-6xl",children:[(0,b.jsx)("div",{className:"mb-8",children:(0,b.jsx)("div",{className:"flex flex-wrap gap-2",children:h.map(a=>(0,b.jsx)("button",{className:`rounded-full px-4 py-2 text-sm font-medium transition-colors ${"全部"===a?"bg-blue-600 text-white":"border border-zinc-300 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"}`,children:a},a))})}),(0,b.jsx)("div",{className:"grid gap-8 md:grid-cols-2 lg:grid-cols-3",children:a.map(a=>(0,b.jsxs)(c.default,{href:`/blog/${a.slug}`,className:"group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all hover:border-blue-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700",children:[(0,b.jsx)("div",{className:"h-48 bg-gradient-to-br from-blue-500 to-purple-600 p-6",children:(0,b.jsx)("span",{className:"inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm",children:a.category})}),(0,b.jsxs)("div",{className:"flex flex-1 flex-col p-6",children:[(0,b.jsx)("h2",{className:"mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400",children:a.title}),(0,b.jsx)("p",{className:"mb-4 text-sm text-zinc-600 dark:text-zinc-400",children:a.excerpt}),(0,b.jsxs)("div",{className:"mt-auto space-y-3",children:[(0,b.jsx)("p",{className:"text-sm text-zinc-600 dark:text-zinc-400",children:a.description}),(0,b.jsx)("div",{className:"flex flex-wrap gap-2",children:a.tags.map((a,c)=>(0,b.jsxs)("span",{className:"flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",children:[(0,b.jsx)(f,{size:12}),a]},c))}),(0,b.jsxs)("div",{className:"flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500",children:[(0,b.jsxs)("div",{className:"flex items-center gap-1",children:[(0,b.jsx)(d.Calendar,{size:14}),(0,b.jsx)("span",{children:a.date})]}),(0,b.jsxs)("div",{className:"flex items-center gap-1",children:[(0,b.jsx)(e.Clock,{size:14}),(0,b.jsx)("span",{children:a.readTime})]})]})]})]})]},a.slug))})]})})]})}a.s(["default",()=>h],56643)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__fb32f649._.js.map