<template>
  <div>
    <div class="margin-lg-top margin-lg-bottom display-flex align-items-center justify-content-center">
      <a-image :src="require('@/assets/400.svg')" />
    </div>

    <h1 class="text-center margin-lg-top margin-lg-bottom">您提交的参数不正确.</h1>

    <a-row type="flex" justify="center" v-if="this.dataSource.length > 0">
      <a-col :span="18">
        <a-table class="ant-table-striped basic-box-shadow" :pagination="false" :data-source="this.dataSource" :columns="this.columns" :scroll="{ x: this.columns.reduce((sum, c) => sum + c.width, 0) }" bordered>

        </a-table>
      </a-col>
    </a-row>

    <div class="text-center margin-lg-top">
      <a-button onclick="$router.back();">
        <icon-font class="icon" type="icon-arrow-left-circle" />
        <span>返回</span>
      </a-button>
    </div>
  </div>

</template>

<script>

export default {
  name: "400",
  created() {
    let json = JSON.parse(sessionStorage.getItem("400"));
    if (json) {
      this.dataSource = json.data || []
    }
  },
  data() {
    return {
      dataSource:[],
      columns:[
        {
          title: "错误代码",
          dataIndex: "code",
          ellipsis: true,
          width: 200
        },
        {
          title: "字段信息",
          dataIndex: "field",
          ellipsis: true,
          width: 200
        },
        {
          title: "错误信息",
          dataIndex: "defaultMessage",
          ellipsis: true,
          width: 300
        }
      ],
    }
  }
}

</script>