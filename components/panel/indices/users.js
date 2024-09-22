
export default {
  apiUrl: 'users',
  searchData: { // 默认查询条件
    type: 1
  },
  props: [ // 字段配置
    {
      title: 'ID',
      dataIndex: 'id',
      dataType: 'string',
      filter: 'number',
      hidden: true
    },
    {
      title: '姓名',
      dataIndex: 'name',
      dataType: 'string',
      filter: 'input', //筛选类型
      rules: [{ required: true, message: '请输入姓名!' }], // 表单验证
      form: 'input', //表单类型
      slot: 'name',
      sorter: true,
    },
    {
      title: '账号',
      dataIndex: 'username',
      dataType: 'string',
      filter: 'input',
      form: 'input',
      rules: [{ required: true, message: '请输入账号!' }], // 表单验证
      filterProps: { // 筛选配置
        op: '=' // 查询操作符
      },
      resolver: username => `${username}(账号)`,// 结果处理器，可使用管道操作命令,

    },
    {
      title: '密码',
      dataIndex: 'passwod',
      dataType: 'string',
      form: 'password',
      formHelp: () => '密码必须为6-12位，且必须包含字母和数字（编辑时不传则不修改）',
      exclude: true
    },
    {
      title: '地址',
      dataIndex: 'address',
      dataType: 'string',
      filter: 'input',
      form: 'input',
    },
    {
      title: '类型',
      dataIndex: 'cate',
      dataType: 'map', // 自动映射字典
      filter: 'select:=', // : 隔开操作符
      mapIndex: 'status2',
      form: 'select',
      filterSpan: 4
    },
    {
      title: '录入时间',
      dataIndex: 'created_at',
      dataType: 'datetime', // 自动格式化时间
      filter: 'range',
      filterProps: {
        type: 'date',
        op: 'range_date'
      },
    }
  ],
  maps: { // 字典配置，可取API
    // status1: ['api:dict.getDicts,user_status', 'mapkv:dict_value,dict_name']
    status2: { a: '状态1', b: '状态2', c: '状态3' }
  },
  post: { // 表单配置
    name: '用户',
    url: '/users/write',
    modalWidth: 600,
  },
  filterNoCol: true, // 不栅格显示过滤条件
  filterFormProps: {
    labelCol: {
      // style: {
      //   width: '64px'
      // }
    },
  },
  delete: { // 删除配置
    url: '/users/:id', // :id 自动注入 record.id
    confirm: record => `确定要删除${record.name}吗?`,
  }
}