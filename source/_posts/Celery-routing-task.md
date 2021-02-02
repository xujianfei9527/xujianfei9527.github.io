---
title: Celery routing tasks
date: 2020-11-20 10:48:37
tags:
- Django
- Celery
- Routing Tasks
---

## Celery简介
Celery是一个简单的，灵活的，可靠的分布式异步任务系统。Celery通过消息列队进行任务调度，支持的broker有rabbitmq、redis等。

### 安装
```
pip install Celery
```

### 集成到Django
项目目录
```
├── config
│   ├── celery.py
│   ├── environment.py
│   ├── environment.pyc
│   ├── __init__.py
│   ├── __init__.pyc
│   ├── __pycache__
│   ├── settings
|   |   ├── base.py
|   |   ├── __init__.py
|   |   ├── local.py
│   ├── urls.py
│   └── wsgi.py
├── db.sqlite3
├── manage.py
├── migrations
│   └── __init__.py
├── README.md

```

在config目录下添加celery.py
```
from celery import Celery

from .environment import SETTINGS_MODULE

os.environ.setdefault('DJANGO_SETTINGS_MODULE', SETTINGS_MODULE)

# 初始化Celery实例
app = Celery('tasks')

# 定义Celery配置方式,此处采用和Django配置集成的方式
app.config_from_object('django.conf:settings', namespace='CELERY')

# 自动发现任务,每个app下tasks.py中定义的任务将会自动发现
app.autodiscover_tasks()

# 定义任务
@app.task()
def demo_task1():
    print('demo_task1 started!')
    time.sleep(1)


@app.task()
def demo_task2():
    print('demo_task2 started!')
    time.sleep(10)

```

添加配置config/settings/local.py
```
CELERY_BROKER_URL = 'redis://127.0.0.1:6379/7'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_RESULT_BACKEND = 'redis://127.0.0.1:6379/6'
CELERY_TASK_SERIALIZER = 'json'
CELERY_MAX_TASKS_PER_CHILD = 10
```
### 启动Celery worker
```
celery -A config worker --concurrency=2 -l info
```
>`--concurrency`指定任务的并发数量，不指定自动设置为cpu的核数

### 调用异步任务
```
from config.celery import demo_task1, demo_task2

demo_task1.delay()
```

## 遇到的问题
以上的基础配置可以满足大部分的使用场景，但随着使用，遇到了以下问题：

我的异步任务中有一类是占用计算资源比较多的(如构建)，这些任务需要根据服务器性能设置并发限制。另一类任务没有多少计算量，多数时间在等待IO。

默认情况下，Celery在同一个队列中运行所有任务，高计算量的任务和IO型任务对并发的限制需求是不同的，如构建任务在4核机器上并发跑4个就比较极限了,但其它一些IO型任务在4核机器上并发100也没有问题，为了保证服务稳定，只能将任务并发设置为4。但其实IO型任务可以并发更多。
## 解决
Celery的[route特性](https://docs.celeryproject.org/en/stable/userguide/routing.html)可以解决此问题。通过启动多个worker指定不同的队列和并发限制，实现任务的分类执行。

增加Celery配置
```
CELERY_TASK_ROUTES = {
    'config.celery.demo_task1': {'queue': 'io_q'},
    'config.celery.demo_task2': {'queue': 'cpu_q'},
}
```
>可以在配置中指定任务的队列，可以在程序中调用任务时指定队列。

启动多个worker
```
celery -A config worker -Q io_q -l info --concurrency=100 -n w1@127.0.0.1
celery -A config worker -Q cpu_q -l info --concurrency=4 -n w2@127.0.0.1
```
