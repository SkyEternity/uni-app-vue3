<template>
	<view class="index-page">
		<u-calendar v-model="show" :mode="mode" @change="change"></u-calendar>
		<u-switch v-model="show"></u-switch>
		<view> </view>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { jurisdictionStore } from '@/store/modules/jurisdiction'
const _jurisdictionStore = jurisdictionStore()
console.log(_jurisdictionStore.userActiveName)
const show = ref(true)

const mode = ref('range')
</script>

<style scoped>
.index-page {
	font-style: normal;
	text-align: center;
}
.h2 {
	color: green;
	font-size: 50rpx;
}
navigator {
	color: #1e80ff;
}
</style>
