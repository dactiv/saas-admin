<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-organization" /> 资源管理</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-upload" /> 导出数据查询</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="导出数据管理" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-group" />
      </template>

      <a-input v-model:value="this.form.filename" @pressEnter="this.search($event)" placeholder="请输入名称进行查询" class="margin-lg-bottom">
        <template #addonAfter>
          <a-button type="text" size="small" @click="search">
            <icon-font class="icon" type="icon-search" />
            <span class="hidden-xs hidden-sm hidden-md">搜索</span>
          </a-button>
        </template>
        <template #addonBefore>
          <a-button type="text" danger size="small" @click=" this.confirm('确定删除 ' + this.selectedIds.length + ' 条导出记录吗？', () => this.remove(this.selectedIds))" :disabled="this.selectedIds.length <= 0 || !this.principal.hasPermission('perms[resource_system:delete_export]')">
            <icon-font class="icon" type="icon-ashbin" />
            <span class="hidden-xs hidden-sm hidden-md">删除选中({{this.selectedIds.length}})</span>
          </a-button>
        </template>
      </a-input>

      <a-table :loading="this.loading" class="ant-table-striped"  :row-selection="{ selectedRowKeys: selectedIds, onChange:this.selectChange }" :rowKey="record=> record.type.value + ':' + record.id" :scroll="{ x: this.columns.reduce((sum, c) => sum + c.width, 0) }" :pagination="false" :data-source="this.loadDataSource" :columns="this.columns" bordered>
        <template #bodyCell="{ column, record}">
          <template v-if="column.dataIndex === 'creationTime'">
            {{this.timestampFormat(record.creationTime)}}
          </template>
          <template v-if="column.dataIndex === 'size'">
            {{this.byteFormat(record.size)}}
          </template>
          <template v-if="column.dataIndex === 'type'">
            <a-tag>{{record.type.name}}</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <div class="text-center">
              <a-dropdown size="small" type="text" placement="bottomRight">
                <template #overlay>
                  <a-menu @click="handleMenuClick($event, record)" >
                    <a-menu-item key="download">
                      <a-space>
                        <icon-font class="icon" type="icon-download" />
                        下载
                      </a-space>
                    </a-menu-item>
                    <a-menu-item key="delete">
                      <a-space>
                        <icon-font class="icon" type="icon-ashbin" />
                        删除
                      </a-space>
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button size="small" >
                  <icon-font class="icon" type="icon-setting"/>
                  操作
                </a-button>
              </a-dropdown>
            </div>
          </template>

        </template>

      </a-table>

    </a-card>
  </div>
</template>

<script>

export default {
  name:"ResourcesAttachmentIndex",
  created() {
    this.loadConfigEnumerate({service:"config", enumerateName:"AttachmentTypeEnum"}).then((r) => this.typeOptions = r.data.data);
    this.loadData();
  },
  methods:{
    selectChange(selectedIds) {
      this.selectedIds = selectedIds;
    },
    search() {
      if (this.form.filename) {
        this.loadDataSource = JSON.parse(JSON.stringify(this.dataSource.filter(s => s.filename.includes(this.form.filename))));
      } else {
        this.loadDataSource = JSON.parse(JSON.stringify(this.dataSource));
      }
    },
    loadData() {
      this.loading = true;
      this.form.filename = "";
      this.$http.get("/api/resources/system/exportList").then(r => {
        this.dataSource = r.data.data || [];
        this.loadDataSource = JSON.parse(JSON.stringify(this.dataSource));
        this.loading = false;
      }).catch(() => this.loading = false);
    },
    handleMenuClick(e, record) {
      if (e.key === 'download') {
        this.downloadFile(record.meta.bucket, record.meta.object)
      } else if(e.key === 'delete') {
        this.confirm("确定删除 [" + record.filename + "] 导出记录吗？", () => this.remove([record.type.value + ":" + record.id]));
      }
    },
    remove(ids) {
      this.loading = true;
      this.$http.post("/api/resources/system/deleteExport", this.formUrlEncoded({ids})).then(r => {
        this.$message.success(r.data.message);
        this.selectedIds = [];
        this.loadData();
      }).catch(() => this.loading = false);
    }
  },
  data() {
    return {
      selectedIds:[],
      loadDataSource:[],
      columns:[
        {
          title: "创建时间",
          dataIndex: "creationTime",
          ellipsis: true,
          width: 150
        },
        {
          title: "文件名称",
          dataIndex: "filename",
          ellipsis: true,
          width: 350
        },
        {
          title: "文件大小",
          dataIndex: "size",
          ellipsis: true,
          width: 100
        },
        {
          title: "类型",
          dataIndex: "type",
          ellipsis: true,
          width: 100
        },
        {
          title: "操作",
          align: "center",
          fixed: "right",
          key: "action",
          width: 110
        }
      ],
      typeOptions:[],
      loading:false,
      dataSource: [],
      form:{
        filename:""
      }
    }
  },
}

</script>