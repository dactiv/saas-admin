<template>

  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-database" /> 资源管理</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-upload" /> 附件管理</a-breadcrumb-item>
    </a-breadcrumb>

    <a-layout>
      <a-layout-sider class="basic-box-shadow" theme="light">
        <a-card title="附件类型" size="small" :bordered="false" :body-style="{padding:'0px'}">
          <template #extra>
            <icon-font class="icon" type="icon-category" />
          </template>
          <a-menu mode="inline" class="border-split-top" :selectedKeys="typeSelectedKey" @select="menuSelect">
            <a-menu-item :key="o.value" v-for="o of this.typeOptions">{{o.name}}</a-menu-item>
          </a-menu>
        </a-card>
      </a-layout-sider>
      <a-layout>
        <a-layout-content class=" margin-lg-left">
          <a-card title="附件内容" size="small" class="basic-box-shadow">
            <template #extra>
              <icon-font class="icon" type="icon-upload" />
            </template>
            <a-input v-model:value="this.form.filename" @pressEnter="search(1, $event)" placeholder="请输入名称进行查询" class="margin-bottom">
              <template #addonAfter>
                <a-button type="text" size="small" :loading="loading" @click="search">
                  <icon-font class="icon" v-if="!loading" type="icon-search" />
                  <span class="hidden-xs hidden-sm hidden-md">搜索</span>
                </a-button>
              </template>
              <template #addonBefore>
                <a-button type="text" :disabled="this.selected.length <= 0" size="small" @click="deleteFile(this.selected)">
                  <icon-font class="icon" type="icon-ashbin" />
                  <span class="hidden-xs hidden-sm hidden-md">删除选中({{this.selected.length}})</span>
                </a-button>
              </template>
            </a-input>

            <a-table :loading="this.loading" class="ant-table-striped" :row-selection="{ selectedRowKeys: selected.map(s => s.objectName), onChange:this.selectChange }" :rowKey="record=>record.objectName" :scroll="{ x: this.columns.reduce((sum, c) => sum + c.width, 0) }" :pagination="false" :data-source="this.dataSource" :columns="this.columns" bordered>
              <template #bodyCell="{column, record}">
                <template v-if="column.dataIndex === 'size'">
                  {{byteFormat(record.size)}}
                </template>
                <template v-if="column.dataIndex === 'mediaType'">
                  {{record.userMetadata['content-type']}}
                </template>
                <template v-if="column.dataIndex === 'lastModified'">
                  {{timestampFormat(record.lastModified)}}
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
                      <a-button size="small">
                        <icon-font class="icon" type="icon-setting"/>
                        操作
                      </a-button>
                    </a-dropdown>
                  </div>
                </template>

              </template>

            </a-table>
          </a-card>
        </a-layout-content>
      </a-layout>
    </a-layout>

  </div>
</template>

<script>

export default {
  name:"ResourcesAttachmentIndex",
  created() {
    this.loadConfigEnumerate({service:"resources", enumerateName:"AttachmentTypeEnum"}).then((r) => {
      for(let d in r.data.data) {
        this.typeOptions.push({
          name:d,
          value:r.data.data[d]
        });
      }

      if (this.typeOptions.length > 0) {
        let first = this.typeOptions[0];
        this.form.type = first.value;
        this.typeSelectedKey = [first.value];
        this.search();
      }
    });
  },
  methods:{
    handleMenuClick(e, record) {
      if (e.key === "download") {
        this.downloadFile(record.bucket, record.objectName);
      } else if (e.key === "delete") {
        this.deleteFile([{bucketName:this.form.type, objectName: record.objectName}]);
      }
    },
    selectChange(selectedKeys, selectedRows) {
      this.selected = selectedRows.map(s => {return {bucketName:this.form.type, objectName:s.objectName}});
    },
    deleteFile(files) {
      this.confirm(files.length > 1 ? "确定要删除 " + files.length + " 条记录吗" : "确定要删除该文件吗", () => {
        let url = "/api/resources/attachment/delete";
        this
            .$http
            .post(url,files)
            .then(r => {
              this.$message.success(r.data.message);
              this.selected = [];
              this.search();
            })
      });
    },
    search() {
      this.loading = true;
      this
          .$http
          .post("/api/resources/attachment/list",this.formUrlEncoded(this.form))
          .then(r => {
            this.dataSource = r.data.data;
            this.loading = false;
          })
          .catch(() => this.loading = false);
    },
    menuSelect(item) {
      this.typeSelectedKey = [item.key];
      this.form.type = item.key;
      this.search();
    }
  },
  data() {
    return {
      selected:[],
      preview:{
        visible:false,
        objectName:"",
        type:"",
        src:undefined
      },
      columns:[
        {
          title: "文件名称",
          dataIndex: "objectName",
          ellipsis: true,
          width: 400
        },
        {
          title: "文件大小",
          dataIndex: "size",
          ellipsis: true,
          width: 150
        },
        {
          title: "媒体类型",
          dataIndex: "mediaType",
          ellipsis: true,
          width: 200
        },
        {
          title: "最后修改时间",
          dataIndex: "lastModified",
          ellipsis: true,
          width: 200
        },{
          title: "操作",
          align: "center",
          fixed: "right",
          key: "action",
          width: 110
        }
      ],
      typeSelectedKey:[],
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