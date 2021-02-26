---
title: Logging
date: 2021-02-24 10:29:34
tags: Python
---

## 日志的作用
* 调试
* 用户行为审计

## Logging模块
Python的日志功能由Logging模块提供。

### 简单使用
简单例子
```
import logging
logging.warning('Watch out!')  # will print a message to the console
logging.info('I told you so')  # 不会输出，因为默认的日志级别是`WARNING`
```
输出的内容如下
```
WARNING:root:Watch out!
```

打日志到文件
```
import logging
logging.basicConfig(filename='example.log',level=logging.DEBUG)
logging.debug('This message should go to the log file')
logging.info('So should this')
logging.warning('And this, too')
```
输出内容如下
```
DEBUG:root:This message should go to the log file
INFO:root:So should this
WARNING:root:And this, too
```

日志的配置
```
logging.basicConfig(filename='example.log', level=logging.DEBUG)
# 输出日志到文件，且日志级别为DEBUG(DEBUG级别以上的日志都会输出)
```

更多配置参数
```
filename  Specifies that a FileHandler be created, using the specified
          filename, rather than a StreamHandler.
filemode  Specifies the mode to open the file, if filename is specified
          (if filemode is unspecified, it defaults to 'a').
format    Use the specified format string for the handler.
datefmt   Use the specified date/time format.
style     If a format string is specified, use this to specify the
          type of format string (possible values '%', '{', '$', for
          %-formatting, :meth:`str.format` and :class:`string.Template`
          - defaults to '%').
level     Set the root logger level to the specified level.
stream    Use the specified stream to initialize the StreamHandler. Note
          that this argument is incompatible with 'filename' - if both
          are present, 'stream' is ignored.
handlers  If specified, this should be an iterable of already created
          handlers, which will be added to the root handler. Any handler
          in the list which does not have a formatter assigned will be
          assigned the formatter created in this function.
force     If this keyword  is specified as true, any existing handlers
          attached to the root logger are removed and closed, before
          carrying out the configuration as specified by the other
          arguments.
encoding  If specified together with a filename, this encoding is passed to
          the created FileHandler, causing it to be used when the file is
          opened.
errors    If specified together with a filename, this value is passed to the
          created FileHandler, causing it to be used when the file is
          opened in text mode. If not specified, the default value is
          `backslashreplace`.
```

### 深入一点
Logging 模块采用了模块化实现，包含4个主要的组件
* Logger 代码使用日志功能的入口
* Handler　将日志发送给合适的日志处理器，比如文件，Socket，终端等
* Filter 日志过滤
* Formatter 日志格式

Logging模块支持3种配置方式
* 直接通过代码创建loggers, handlers 和 formatter
* 使用`fileConfig()`从配置文件中读取
* 使用`dictConfig()`从一个配置字段中读取

这里演示通过代码方式创建
```

# create logger
logger = logging.getLogger('simple_example')
logger.setLevel(logging.DEBUG)

# create console handler and set level to debug
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)

# create formatter
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# add formatter to ch
ch.setFormatter(formatter)

# add ch to logger
logger.addHandler(ch)

# 'application' code
logger.debug('debug message')
logger.info('info message')
logger.warn('warn message')
logger.error('error message')
logger.critical('critical message')
```



## Django中Logging的使用
Django中日志配置(配置字典方式)
```
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'handlers': {
        'django_handler': {
            'level': 'INFO',
            'class': 'logging.handlers.TimedRotatingFileHandler', # 这里配置了日志滚动
            'filename': 'error.log',
            'when': 'midnight',
            'interval': 1,
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'task_handler': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'info.log',
            'formatter': 'verbose',
        }
    },
    'loggers': {
        'django': { # Django中的默认logger
            'handlers': ['django_handler'],
            'propagate': True,
        },
        'task': {
            'handlers': ['task_handler'],
            'propagate': True,
        }
    }
}
```

在代码中调用日志模块
```
imporg logging

logger = logging.getLogger('task')
logger.info("task started.")

```

## 参考
[logging-basic-tutorial](https://docs.python.org/3.6/howto/logging.html#logging-basic-tutorial)
[Guide to Python - Logging](https://docs.python-guide.org/writing/logging/)