module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},50645,a=>{a.n(a.i(27572))},4892,a=>{a.n(a.i(47830))},78098,a=>{a.n(a.i(55364))},17513,a=>{a.n(a.i(32605))},49049,a=>{a.n(a.i(84813))},66007,(a,b,c)=>{let{createClientModuleProxy:d}=a.r(68039);a.n(d("[project]/node_modules/.pnpm/next@16.0.10_@babel+core@7.28.5_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/dist/client/app-dir/link.js <module evaluation>"))},95771,(a,b,c)=>{let{createClientModuleProxy:d}=a.r(68039);a.n(d("[project]/node_modules/.pnpm/next@16.0.10_@babel+core@7.28.5_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/dist/client/app-dir/link.js"))},8199,a=>{"use strict";a.i(66007);var b=a.i(95771);a.n(b)},34222,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={default:function(){return i},useLinkStatus:function(){return h.useLinkStatus}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(54508),g=a.r(49624),h=f._(a.r(8199));function i(a){let b=a.legacyBehavior,c="string"==typeof a.children||"number"==typeof a.children||"string"==typeof a.children?.type,d=a.children?.type?.$$typeof===Symbol.for("react.client.reference");return!b||c||d||(a.children?.type?.$$typeof===Symbol.for("react.lazy")?console.error("Using a Lazy Component as a direct child of `<Link legacyBehavior>` from a Server Component is not supported. If you need legacyBehavior, wrap your Lazy Component in a Client Component that renders the Link's `<a>` tag."):console.error("Using a Server Component as a direct child of `<Link legacyBehavior>` is not supported. If you need legacyBehavior, wrap your Server Component in a Client Component that renders the Link's `<a>` tag.")),(0,g.jsx)(h.default,{...a})}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},37697,50404,13172,13681,a=>{"use strict";var b=a.i(45089);let c=a=>{let b=a.replace(/^([A-Z])|[\s-_]+(\w)/g,(a,b,c)=>c?c.toUpperCase():b.toLowerCase());return b.charAt(0).toUpperCase()+b.slice(1)},d=(...a)=>a.filter((a,b,c)=>!!a&&""!==a.trim()&&c.indexOf(a)===b).join(" ").trim();var e={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let f=(0,b.forwardRef)(({color:a="currentColor",size:c=24,strokeWidth:f=2,absoluteStrokeWidth:g,className:h="",children:i,iconNode:j,...k},l)=>(0,b.createElement)("svg",{ref:l,...e,width:c,height:c,stroke:a,strokeWidth:g?24*Number(f)/Number(c):f,className:d("lucide",h),...!i&&!(a=>{for(let b in a)if(b.startsWith("aria-")||"role"===b||"title"===b)return!0})(k)&&{"aria-hidden":"true"},...k},[...j.map(([a,c])=>(0,b.createElement)(a,c)),...Array.isArray(i)?i:[i]])),g=(a,e)=>{let g=(0,b.forwardRef)(({className:g,...h},i)=>(0,b.createElement)(f,{ref:i,iconNode:e,className:d(`lucide-${c(a).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${a}`,g),...h}));return g.displayName=c(a),g};a.s(["default",()=>g],50404);let h=g("calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);a.s(["Calendar",()=>h],37697);let i=g("clock",[["path",{d:"M12 6v6l4 2",key:"mmk7yg"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);a.s(["Clock",()=>i],13172);let j=[{slug:"python-memory-management",title:"深入理解Python内存管理机制",description:"探索Python的内存分配、垃圾回收和引用计数机制，以及如何优化内存使用",date:"2025-01-15",readTime:"12 分钟",category:"Python",tags:["Python","内存管理","性能优化"],content:`# 深入理解Python内存管理机制

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
`}];function k(){return j.sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime())}function l(a){return j.find(b=>b.slug===a)||null}function m(){return Array.from(new Set(j.map(a=>a.category))).sort()}a.s(["getAllBlogPosts",()=>k,"getBlogCategories",()=>m,"getBlogPostBySlug",()=>l],13681)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__889e4a55._.js.map