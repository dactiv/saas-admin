<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-enum-major-o" /> 基础信息配置</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-carousel" /> 轮播图管理</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="轮播图管理" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-carousel" />
      </template>

      <a-tabs size="small" v-model:active-key="this.tab.active" centered class="margin-lg-bottom">
        <a-tab-pane :key="value" v-for="(value, name) of this.typeOptions">
          <template #tab>
            <span>
              {{ name }}
            </span>
          </template>

          <a-spin :spinning="this.tab[value.toString()].loading">
            <a-row v-if="this.tab[value].dataSource.length <= 0" style="height: 420px;" class="border " type="flex" justify="space-around" align="middle">
              <a-col :span="24">
                <a-empty />
              </a-col>
            </a-row>

            <a-carousel v-else arrows class="border">
             <template #prevArrow>
                <div class="custom-slick-arrow" style="left: 10px; z-index: 1">
                  <icon-font type="icon-arrow-left-bold" />
                </div>
              </template>
              <template #nextArrow>
                <div class="custom-slick-arrow" style="right: 10px">
                  <icon-font type="icon-arrow-right-bold" />
                </div>
              </template>
              <span :key="item.id" v-for="item in this.tab[value].dataSource" class="item align-items-center justify-content-center">
                <img :src="'/api/' + item.cover.link" />
              </span>
            </a-carousel>

          </a-spin>

        </a-tab-pane>
      </a-tabs>

      <a-input v-model:value="this.form['filter_[name_like]']" @pressEnter="this.search(1,$event)"  placeholder="请输入名称进行查询" class="margin-lg-bottom">
        <template #addonAfter>
          <a-button type="text" size="small" @click="this.search(1)" :loading="this.loading">
            <icon-font class="icon" v-if="!this.loading" type="icon-search" />
            <span class="hidden-xs hidden-sm hidden-md">搜索</span>
          </a-button>
        </template>
        <template #addonBefore>
          <a-button type="text" size="small" @click="this.edit()" :loading="this.loading">
            <icon-font class="icon"  type="icon-add" />
            <span class="hidden-xs hidden-sm hidden-md">添加</span>
          </a-button>
        </template>
      </a-input>

      <a-list item-layout="vertical" :data-source="this.page.elements" bordered>
        <template #renderItem="{ item }">
          <a-badge-ribbon style="z-index: 1" :text="item.status.name" :color="this.statusSetting[item.status.value.toString()].color" />
          <a-list-item :key="item.id">
            <template #actions>
              <a-space class="margin-top">
                <a-button size="small" v-if="item.status.value !== 20" type="primary" @click="this.confirm('确定要发布该轮播图吗?', () => this.publish([item.id]))" :disabled="!this.principal.hasPermission('perms[carousel:publish]')">
                  <icon-font class="icon" type="icon-select"/>
                  <span class="hidden-xs hidden-sm hidden-md">发布</span>
                </a-button>
                <a-button size="small" v-if="item.status.value === 20" type="primary" @click="this.confirm('确定要下架该轮播图吗?', () => this.undercarriage([item.id]))" :disabled="!this.principal.hasPermission('perms[carousel:undercarriage]')">
                  <icon-font class="icon" type="icon-direction-down-circle"/>
                  <span class="hidden-xs hidden-sm hidden-md">下架</span>
                </a-button>
                <a-button size="small" danger type="primary" @click="this.confirm('确定要删除该轮播图吗?', () => this.delete([item.id]))" :disabled="!this.principal.hasPermission('perms[carousel:delete]')">
                  <icon-font class="icon" type="icon-ashbin"/>
                  <span class="hidden-xs hidden-sm hidden-md">删除</span>
                </a-button>
                <a-button size="small" @click="this.edit(item)" :disabled="!this.principal.hasPermission('perms[carousel:get]')">
                  <icon-font class="icon" type="icon-file"/>
                  <span class="hidden-xs hidden-sm hidden-md">详情</span>
                </a-button>
              </a-space>
            </template>
            <template #extra>
              <a-row class="height-100-percent" type="flex" justify="space-around" align="middle">
                <a-col :span="24">
                  <a target="_blank" :href="item.link.type + item.link.value">
                    <img :style="{width:'200px'}" alt="logo" :src="'/api/' + item.cover.link"/>
                  </a>
                </a-col>
              </a-row>
            </template>
            <a-list-item-meta>
              <template #title>
                <a-tag :color="this.typeSetting[item.type.value * 1].color">{{ item.type.name }}</a-tag> {{item.name}}
              </template>
              <template #description>
                链接地址: <a target="_blank" :href="item.link.type + item.link.value">{{ item.link.type + item.link.value }}</a>
              </template>
            </a-list-item-meta>
            {{ item.remark }}
          </a-list-item>
        </template>
      </a-list>

      <div class="margin-md-top text-right" >

        <a-space>
          <span class="hidden-xs hidden-sm hidden-md">每页</span>
          <a-input v-model:value="this.page.size" size="small" @pressEnter="search(1, $event)" :maxlength="4" class="text-center hidden-xs hidden-sm hidden-md" style="width: 50px" />
          <span class="hidden-xs hidden-sm hidden-md">条 / 第 {{this.page.number}} 页</span>
          <a-button size="small" @click="search(page.number - 1)" :disabled="this.page.first"><icon-font type="icon-arrow-left-bold" /></a-button>
          <a-button size="small" @click="search(page.number + 1)" :disabled="this.page.last"><icon-font type="icon-arrow-right-bold" /></a-button>
        </a-space>

      </div>

    </a-card>
  </div>
</template>

<style scoped>

.ant-carousel :deep(.slick-slide) {
  height: 420px;
  line-height: 420px;
  overflow: hidden;
}

.ant-carousel :deep(.item) {
  height: 420px;
  display: flex !important;
  overflow: hidden;
}

.ant-carousel img {
  background-size:cover;
  object-fit:cover;
}

.ant-carousel :deep(.slick-arrow.custom-slick-arrow) {
  width: 25px;
  height: 25px;
  font-size: 25px;
  color: #fff;
  background-color: rgba(31, 45, 61, 0.11);
  opacity: 0.3;
  z-index: 1;
}
.ant-carousel :deep(.custom-slick-arrow:before) {
  display: none;
}
.ant-carousel :deep(.custom-slick-arrow:hover) {
  opacity: 0.5;
}
</style>

<script>

export default {
  name:"AdminCarouselIndex",
  data() {
    return {
      demoDataSource:[],
      form: {
        "filter_[name_like]":""
      },
      typeSetting: {
        "10":{
          color:"default"
        },
        "15":{
          color:"success"
        },
        "20":{
          color:"processing"
        }
      },
      statusSetting:{
        "10":{
          color:"green"
        },
        "15":{
          color:"lime"
        },
        "20":{
          color:"blue"
        }
      },
      tab: {
        active:undefined
      },
      typeOptions:[],
      page: {
        elements:[],
        first:true,
        last:true,
        number:1
      },
      loading: false,
    }
  },
  created() {
    this
        .loadConfigEnumerate({service:"admin", enumerateName:"CarouselType"})
        .then((r) => {
          this.typeOptions = r.data.data
          for (let key in this.typeOptions) {
            this.tab[this.typeOptions[key]] = {};
            this.tab[this.typeOptions[key]].dataSource = [];
            this.tab[this.typeOptions[key]].loading = false;
            this.searchPublish(this.typeOptions[key]);
          }
        });
    this.search();
  },
  methods:{
    edit(record) {

      let to = {
        name: "config_carouse_edit"
      }

      if (record !== undefined) {
        to["query"] = { id:record.id };
      }

      this.$router.push(to);

    },
    undercarriage(ids) {
      this.loading = true;
      this
          .$http
          .post("/api/admin/carousel/undercarriage", this.formUrlEncoded({ids}))
          .then(r => {
            this.$message.success(r.data.message);
            this.search(1)
            this.loading = false;
          })
          .catch(() => this.loading = false);
    },
    publish(ids) {
      this.loading = true;
      this
          .$http
          .post("/api/admin/carousel/publish", this.formUrlEncoded({ids}))
          .then(r => {
            this.$message.success(r.data.message);
            this.search(1)
            this.loading = false;
          })
          .catch(() => this.loading = false);
    },
    delete(ids) {
      this.loading = true;
      this
          .$http
          .post("/api/admin/carousel/delete", this.formUrlEncoded({ids}))
          .then(r => {
            this.$message.success(r.data.message);
            this.search(1)
            this.loading = false;
          })
          .catch(() => this.loading = false);
    },
    searchPublish(value) {
      this.tab[value].loading = true;
      let param = {"filter_[type_eq]":value}
      this
          .$http
          .post("/api/admin/carousel/findByFrontEnd", this.formUrlEncoded(param))
          .then(r => {
            this.tab[value].dataSource = r.data.data || [];
            this.tab[value].loading = false;
          })
          .catch(() => this.tab[value].loading = false);
    },
    search(number) {
      let param = this.form;

      param.size = this.page.size || 10;
      param.number = number || this.page.number;

      this.loading = true;

      this
          .$http
          .post("/api/admin/carousel/page", this.formUrlEncoded(param))
          .then(r => {
            this.page = r.data.data;
            this.loading = false;
          })
          .catch(() => this.loading = false);
    }
  }
}

</script>