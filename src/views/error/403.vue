<template>
  <div>
    <div class="margin-lg-top margin-lg-bottom display-flex align-items-center justify-content-center">
      <a-image :src="require('@/assets/403.svg')" />
    </div>
    <h1 class="text-center margin-lg-top margin-lg-bottom">您没有权限访问,请联系管理员开通权限.</h1>
    <div class="text-center">

      <a-space>
        <a-button @click="$router.back();">
          <icon-font class="icon" type="icon-arrow-left-circle" />
          <span>返回</span>
        </a-button>

        <a-button type="primary" @click="logout">
          <icon-font class="icon" type="icon-sign-out" />
          <span>重新登陆</span>
        </a-button>
      </a-space>

    </div>
  </div>
</template>

<script>

import {PRINCIPAL_ACTION_TYPE} from "@/store/principal";

export default {
  name: "403",
  methods: {
    logout:function () {
      this.$store.dispatch(PRINCIPAL_ACTION_TYPE.Logout).then(() => this.$router.push(process.env.VUE_APP_LOGIN_PAGE));
    }
  }
}

</script>