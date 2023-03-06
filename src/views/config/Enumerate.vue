<template>
  <div>
    <a-breadcrumb class="hidden-xs">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-enum-major-o" /> 基础信息配置</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-file-common" /> 系统枚举查询</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="系统枚举查询" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <a-button :loading="sync" @click="syncEnumerate" v-if="principal.hasPermission('perms[enumerate:sync]')">
          <icon-font class="icon" v-if="!sync" type="icon-history"/>
          <span class="hidden-xs">同步枚举</span>
        </a-button>
      </template>

      <a-spin :spinning="spinning">

        <a-tabs>

          <a-tab-pane class="width-100-percent" v-for="(value, key) of enumData" :key="key" :tab="key">
            <a-collapse>
              <a-collapse-panel v-for="(enumValue, name) of value" :key="name" :header="'枚举名: ' + name">
                <a-descriptions bordered layout="vertical" :column="{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }">

                  <a-descriptions-item v-for="(targetValue, targetKey) of enumValue" :key="targetKey" :label="targetKey">{{ targetValue }}</a-descriptions-item>

                </a-descriptions>
              </a-collapse-panel>
            </a-collapse>
          </a-tab-pane>

        </a-tabs>

      </a-spin>

    </a-card>
  </div>
</template>

<script>

export default {
  name:"ConfigEnumerateIndex",
  data() {
    return {
      sync:false,
      spinning:false,
      enumData:{}
    }
  },
  methods:{
    syncEnumerate() {
      this.sync = true;

      this
          .$http
          .post("/api/config/syncEnumerate")
          .then(r => {
            this.sync = false;
            this.$message.success(r.data.message);
            this.enumData = r.data.data;
          })
          .catch(() => this.sync = false);

    }
  },
  created() {

    this.spinning = true;

    this
        .$http
        .get("/api/config/enumerate")
        .then(r => {
          this.enumData = r.data.data;
          this.spinning = false;
        })
        .catch(() => this.spinning = false);
  }
}

</script>