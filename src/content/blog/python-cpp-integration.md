---
title: Python与C++混合编程实战
description: 学习如何使用PyBind11和Cython实现Python与C++的高效集成
date: 2025-01-05
readTime: 18 分钟
category: Python
tags: ['Python', 'C++', 'PyBind11', 'Cython']
---

# Python与C++混合编程实战

## 引言

在某些高性能场景下，我们需要将Python的易用性与C++的性能优势结合起来。本文将介绍Python与C++混合编程的两种主要方案：PyBind11和Cython。

## PyBind11

PyBind11是一个轻量级的header-only库，用于在Python和C++之间创建绑定。

### 安装

```bash
pip install pybind11
```

### 基础示例

创建一个简单的C++模块：

```cpp
// example.cpp
#include <pybind11/pybind11.h>

int add(int i, int j) {
    return i + j;
}

PYBIND11_MODULE(example, m) {
    m.doc() = "pybind11 example plugin";
    m.def("add", &add, "A function which adds two numbers");
}
```

编译为Python扩展：

```bash
c++ -O3 -Wall -shared -std=c++11 -fPIC \
    $(python3 -m pybind11 --includes) \
    example.cpp \
    -o example$(python3-config --extension-suffix)
```

### 类的绑定

```cpp
#include <pybind11/pybind11.h>

class Pet {
public:
    Pet(const std::string &name) : name(name) {}
    void setName(const std::string &name_) { name = name_; }
    const std::string &getName() const { return name; }

private:
    std::string name;
};

namespace py = pybind11;
PYBIND11_MODULE(pet, m) {
    py::class_<Pet>(m, "Pet")
        .def(py::init<const std::string &>())
        .def("set_name", &Pet::setName)
        .def("get_name", &Pet::getName);
}
```

Python中使用：

```python
import pet

p = pet.Pet("Molly")
print(p.get_name())
p.set_name("Tom")
print(p.get_name())
```

### NumPy数组互操作

```cpp
#include <pybind11/pybind11.h>
#include <pybind11/numpy.h>

namespace py = pybind11;

double sum(py::array_t<double> array) {
    py::buffer_info buf = array.request();
    double *ptr = static_cast<double *>(buf.ptr);

    double sum = 0;
    for (size_t i = 0; i < buf.size; i++) {
        sum += ptr[i];
    }
    return sum;
}

PYBIND11_MODULE(numpy_example, m) {
    m.def("sum", &sum);
}
```

## Cython

Cython是Python的超集，可以将Python代码编译为C扩展。

### 安装

```bash
pip install cython
```

### 基础示例

创建 `example.pyx`：

```cython
# example.pyx
def say_hello(name):
    return f"Hello, {name}!"
```

创建 `setup.py`：

```python
from setuptools import setup
from Cython.Build import cythonize

setup(
    ext_modules=cythonize("example.pyx")
)
```

编译：

```bash
python setup.py build_ext --inplace
```

### 类型声明

```cython
# example.pyx
def sum_list(list[int] numbers):
    cdef int total = 0
    cdef int n
    for n in numbers:
        total += n
    return total
```

### C函数调用

```cython
# example.pyx
# distutils: language = c
# distutils: extra_compile_args = -O3

cdef int c_function(int n):
    return n * 2

def python_function(int n):
    return c_function(n)
```

## 性能对比

让我们比较三种方式的性能：

```python
import numpy as np

# 纯Python
def sum_python(arr):
    total = 0
    for x in arr:
        total += x
    return total

# NumPy
def sum_numpy(arr):
    return np.sum(arr)

# C++ (PyBind11)
import example
def sum_cpp(arr):
    return example.sum(arr)
```

性能测试结果（处理100万元素）：
- 纯Python: ~200ms
- NumPy: ~5ms
- C++ (PyBind11): ~3ms

## 最佳实践

### 何时使用PyBind11

- 需要将现有C++代码暴露给Python
- 需要高性能的数值计算
- 想要使用C++的类型系统和模板

### 何时使用Cython

- 优化现有Python代码
- 需要渐进式优化
- 更容易的部署（无需单独编译C++）

### 性能优化建议

1. **避免频繁的数据拷贝**：使用NumPy数组缓冲区直接访问
2. **使用类型声明**：在Cython中声明变量类型
3. **释放GIL**：在长时间运行的C++代码中释放全局解释器锁

## 总结

Python与C++混合编程提供了强大的能力：

1. **PyBind11** - 适合C++代码集成，类型安全
2. **Cython** - 适合Python优化，渐进式改进
3. **性能提升** - 可获得接近纯C++的性能

根据你的具体需求选择合适的方案，在保持Python易用性的同时获得C++的性能优势。
