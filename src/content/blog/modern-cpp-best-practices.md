---
title: 现代C++最佳实践指南
description: 了解C++11/17/20的新特性，掌握现代C++编程的最佳实践
date: 2025-01-10
readTime: 15 分钟
category: C++
tags: ['C++', '现代C++', '编程实践']
---

# 现代C++最佳实践指南

## 引言

现代C++（C++11/17/20）引入了许多强大特性，让我们能够编写更安全、更高效的代码。本文将介绍这些新特性以及如何在实际项目中应用它们。

## 智能指针

### unique_ptr

`unique_ptr` 是独占所有权的智能指针，当它离开作用域时自动删除对象。

```cpp
#include <memory>

std::unique_ptr<int> ptr = std::make_unique<int>(42);

// 转移所有权
std::unique_ptr<int> ptr2 = std::move(ptr);
```

### shared_ptr

`shared_ptr` 是共享所有权的智能指针，使用引用计数管理对象生命周期。

```cpp
#include <memory>

auto ptr = std::make_shared<int>(42);
auto ptr2 = ptr;  // 共享所有权
```

### weak_ptr

`weak_ptr` 用于观察 `shared_ptr`，不增加引用计数，避免循环引用。

```cpp
std::weak_ptr<int> weak = ptr;
if (auto shared = weak.lock()) {
    // 使用shared
}
```

## Lambda表达式

Lambda提供了简洁的匿名函数语法。

```cpp
auto func = [](int x, int y) { return x + y; };

// 捕获列表
int value = 10;
auto lambda = [value](int x) { return x + value; };
```

## auto关键字

`auto` 自动推导类型，提高代码可读性。

```cpp
auto x = 42;  // int
auto y = 3.14;  // double
auto z = std::make_unique<int>(42);  // std::unique_ptr<int>
```

## 范围for循环

更简洁的遍历语法。

```cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

for (const auto& item : vec) {
    std::cout << item << " ";
}
```

## 右值引用与移动语义

移动语义避免不必要的拷贝，提高性能。

```cpp
std::string str1 = "Hello";
std::string str2 = std::move(str1);  // 移动而非拷贝
```

## constexpr

编译期常量表达式，提升性能。

```cpp
constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

constexpr int result = factorial(5);  // 编译期计算
```

## 线程支持库

C++11提供了原生的线程支持。

```cpp
#include <thread>
#include <mutex>

std::mutex mtx;
int counter = 0;

void increment() {
    std::lock_guard<std::mutex> lock(mtx);
    counter++;
}

std::thread t1(increment);
std::thread t2(increment);
t1.join();
t2.join();
```

## 文件系统库

C++17引入了 `std::filesystem`，简化文件操作。

```cpp
#include <filesystem>

namespace fs = std::filesystem;

// 检查文件是否存在
if (fs::exists("file.txt")) {
    // 处理文件
}

// 遍历目录
for (const auto& entry : fs::directory_iterator(".")) {
    std::cout << entry.path() << std::endl;
}
```

## 结构化绑定

C++17引入的结构化绑定让代码更清晰。

```cpp
std::pair<int, int> p = {1, 2};
auto [x, y] = p;  // x = 1, y = 2

std::map<int, std::string> m = {{1, "one"}, {2, "two"}};
for (const auto& [key, value] : m) {
    std::cout << key << ": " << value << std::endl;
}
```

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
