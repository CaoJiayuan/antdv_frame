## CURD 面板

通过配置完成CURD面板，包含列表展示、筛选、新增、编辑、删除

### 1.列表
规定列表请求方式为```POST```

> 请求

如 ```POST``` ```/api/users```
请求body为json
```
{
    "page": 1, // 页码，可选
    "per_page": 15, // 每页数量，可选
    "filters": { // 过滤参数，可选
        "name": "张",
        "age,>": 30,
        "created_at,between": ["2023-09-10 12:22:10", "2024-09-10 12:22:10"]
    },
    "sort": { // 排序列，可选
        "id": "desc" 
    }
}
```

其中筛选定义为 ```filters[字段,操作符] = 值``` 需要后端适配实现

>响应

列表返回数据格式
```json
{
    "meta": {
        "total": 3,
        "per_page": 15,
        "page": 1,
        "last_page": 1,
        "from": 1,
        "to": 3
    },
    "data": [
        {
            "id": 1,
            "name": "张三" 
        },
        ...
    ]
}
```

### 2.创建/更新
规定列表请求方式为```POST```
> 请求

如 ```POST``` ```/api/users/create```

请求body为json
```json

{
    "id": 1, // 传则更新，不传则修改
    "name": "张三" 
}
```

创建与更新共用接口，根据传入的id字段判断