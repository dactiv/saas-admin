<template>
  <div>
    <a-breadcrumb class="hidden-xs">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-enum-major-o" /> 基础信息配置</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-variable" /> 环境变量查询</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="环境变量查询" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-variable" />
      </template>

      <a-spin :spinning="spinning">

        <a-tabs>

          <a-tab-pane v-for="(value, key) of variableData" :key="key" :tab="key">

            <a-collapse>

              <a-collapse-panel v-for="source of value.propertySources" :key="source.name" :header="source.name">

                <a-descriptions v-if="source.properties" bordered :column="{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }">

                  <a-descriptions-item v-for="(propertyValue, propertyKey) of source.properties" :key="propertyKey" :label="propertyKey">{{ propertyValue.value }}</a-descriptions-item>

                </a-descriptions>

                <a-empty v-else />

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
  name:"ConfigEnvironmentIndex",
  data() {
    return {
      spinning:false,
      variableData:{}
    }
  },
  created() {

    this.spinning = true;

    this
        .$http
        .get("/api/config/environment")
        .then(r => {
          this.variableData = r.data.data;
          this.spinning = false;
        })
        .catch(() => this.spinning = false);
  }
}

</script>