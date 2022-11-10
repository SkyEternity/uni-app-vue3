<template>
    <view class="meeting_form" v-show="isDataShow">
        <u-form :model="form" ref="formRef" class="form form_class" :error-type="errorType">
            <u-form-item label="会议类型" :required="true" :label-width="200" prop="template_id" :right-icon="meetingType != 'edit' ? 'arrow-right' : 'none'">
                <u-input placeholder="请选择" disabled v-model="form.template_name" @click="templateShow = true" />
                <u-select v-model="templateShow" v-if="meetingType != 'edit'" :list="templateList" value-name="id" label-name="name" @confirm="handleTemplateConfirm"></u-select>
            </u-form-item>
            <u-form-item label="会议主题" v-if="template_content_object?.subject?.checked" :required="template_content_object?.subject?.require" :label-width="200" prop="subject">
                <u-input placeholder="请输入" v-model="form.subject" />
            </u-form-item>
            <u-form-item
                label="会议室"
                v-if="template_content_object?.roomid?.checked"
                :required="template_content_object?.roomid?.require"
                :label-width="200"
                prop="room_name"
                right-icon="arrow-right"
            >
                <u-input placeholder="请选择" v-model="form.room_name" disabled @click="skipRoomList" />
            </u-form-item>
            <u-form-item
                label="会议时间"
                v-if="template_content_object?.startdate?.checked"
                :required="template_content_object?.startdate?.require"
                :label-width="200"
                prop="time"
                right-icon="clock"
                class="select_time"
            >
                <u-input placeholder="请选择会议时间" v-model="form.time" disabled @click="isShow1 = true" />
                <u-picker mode="time" v-model="isShow1" @confirm="conTimeFn1" :params="timeParmas" confirm-text="下一步" title="开始时间" :start-year="moment().format('YYYY')"></u-picker>
                <u-picker mode="time" v-model="isShow3" @confirm="conTimeFn3" :params="timeParmasStep" confirm-text="确定" title="结束时间" :start-year="moment().format('YYYY')"></u-picker>
            </u-form-item>
            <template v-if="form.cycleName">
                <u-form-item prop="cycleName" label="会议周期" :label-width="200" class="period" :required="template_content_object?.cycle?.require">
                    <u-input placeholder="" v-model="form.cycleName" disabled @click="skipView('/pages/meeting/period', 1)" />
                    <u-icon name="close" color="#9E9E9E" size="30" class="icon" @click="removePeriod" />
                </u-form-item>
                <u-form-item label="周期截止时间" :label-width="250" class="period">
                    <u-input placeholder="请选择周期截止时间" v-model="form.cycle_end_date" disabled @click="isShow4 = true" />
                    <u-picker
                        mode="time"
                        :start-year="moment().format('YYYY')"
                        v-model="isShow4"
                        @confirm="conTimeFn"
                        :params="{
                            year: true,
                            month: true,
                            day: true,
                            hour: false,
                            minute: false
                        }"
                    ></u-picker>
                </u-form-item>
                <u-form-item label="跳过法定节假日" :label-width="260" class="period">
                    <u-switch v-model="form.skip_holiday" :active-value="1" :inactive-value="0" active-color="#03C2C5" :size="40"></u-switch>
                </u-form-item>
            </template>
            <view class="select_time_block" v-if="isSelectTimeShow">
                <u-tabs
                    :list="tabList"
                    :bold="true"
                    active-color="#03C2C5"
                    bar-width="80"
                    height="88"
                    bar-height="6"
                    font-size="28"
                    :is-scroll="false"
                    v-model="current"
                    item-width="10"
                    @change="listchangeFn"
                    @click="tabClick"
                />
                <view class="time_info">
                    <view class="tip">
                        <image src="@/static/images/meeting/tip.svg" />
                        点击小方块进行预约，每个方格15分钟，一个小时划分4个方格
                    </view>
                    <TimeSelect ref="timeSelectRef" :date="date" :timeArr="timeArr" @onOk="onOkFn" @change="changeTime" />
                </view>
                <u-picker mode="time" v-model="isShow2" @confirm="conDateFn" start-year="2022" end-year="2024"></u-picker>
            </view>
            <view style="height: 20rpx; background: #f0f0f0"></view>
            <u-form-item
                prop="leadersList"
                label="主持人"
                v-if="template_content_object?.leaders?.checked"
                :required="template_content_object?.leaders?.require"
                :label-width="200"
                style="margin-left: 32rpx"
                right-icon="arrow-right"
            >
                <u-input :placeholder="form.leadersList.length > 0 ? null : '请选择'" disabled @click="skipUserTree(1)" />
                <view class="user_box" v-if="form.leadersList.length > 0" @click="skipUserTree(1)">
                    <view class="user_item">
                        <image :src="form.leadersList[0].avatar" class="user_avatar" />
                    </view>
                </view>
            </u-form-item>
            <u-form-item
                prop="attendersList"
                label="参会人"
                :border-bottom="false"
                v-if="template_content_object?.attenders?.checked"
                :required="template_content_object?.attenders?.require"
                :label-width="200"
                right-icon="arrow-right"
                style="margin-left: 32rpx"
            >
                <u-input :placeholder="form.attendersList.length > 0 ? null : '请选择'" disabled @click="skipUserTree(0)" />
                <view class="user_box" v-if="form.attendersList.length != 0" @click="skipUserTree(0)">
                    <view class="user_item" v-for="(item, i) in form.attendersList" :key="item.id" v-show="i < 4">
                        <image :src="item.avatar" class="user_avatar" />
                    </view>
                </view>
            </u-form-item>
            <view v-if="template_content_object?.video?.checked">
                <view style="height: 20rpx; background: #f0f0f0"></view>
                <u-form-item prop="open_vcs_switch" label="视频会议" :label-width="200" class="video_item" :required="template_content_object?.video?.require">
                    <u-switch v-model="form.open_vcs_switch" active-color="#03C2C5" :size="40"></u-switch>
                </u-form-item>
                <u-form-item label="会议密码" :label-width="200" :border-bottom="false" v-if="form.open_vcs_switch">
                    <u-input placeholder="请输入" v-model="form.vcs_live_password" />
                </u-form-item>
            </view>
            <u-form-item
                prop="summary"
                label="会议内容"
                v-if="template_content_object?.describe?.checked"
                :required="template_content_object?.describe?.require"
                label-position="top"
                class="border_top"
            >
                <u-input v-model="form.summary" type="textarea" maxlength="-1" :border="border" height="200" auto-height placeholder="请输入" />
            </u-form-item>
            <u-form-item
                prop="files"
                label="上传附件"
                v-if="template_content_object?.files?.checked"
                :required="template_content_object?.files?.require"
                label-position="top"
                :label-width="200"
                class="accessory"
                :border-bottom="form.template_data?.length > 0"
            >
                <Upload
                    ref="uploadRef"
                    childId="upload"
                    width="80rpx"
                    height="80rpx"
                    :option="uploadParams"
                    :size="10"
                    :debug="true"
                    :instantly="true"
                    @progress="onProgressAccessoryFn"
                    @change="onChange"
                    class="upload_class"
                >
                    <u-icon name="plus-circle" color="#03C2C5" size="50" class="plus_circle" />
                </Upload>
                <view class="item_info" v-for="(item, i) in accessoryList" :key="item.file_name">
                    <view>
                        <image v-if="item.isImg" :src="item.file_path.includes('http') ? item.file_path : _globalStore.imgUrl + item.file_path" class="add_icon" />
                        <image v-else src="@/static/images/meeting/file_icon.svg" class="add_icon" />
                    </view>
                    <view class="desc">
                        <view>{{ item.file_name }}</view>
                        <text>{{ item.file_size }}MB</text>
                        <u-icon name="close" color="#9E9E9E" size="34" class="close_icon" @click="removeAccessory(i)" />
                    </view>
                </view>
            </u-form-item>

            <!-- 自定义字段 -->

            <template v-for="(filedItem, filedIndex) in form.template_data" :key="filedIndex">
                <u-form-item v-if="filedItem.type === '1'" :required="filedItem.require" :label="filedItem.label" :prop="filedItem.label" label-position="top" label-width="auto">
                    <u-input v-model="form[filedItem.label]" :placeholder="filedItem.placeholder" class="cus-text-input"></u-input>
                </u-form-item>
                <u-form-item v-if="filedItem.type === '2'" :required="filedItem.require" :label="filedItem.label" :prop="filedItem.label" label-position="top" label-width="auto">
                    <u-input v-model="form[filedItem.label]" rows="4" type="textarea" resize="none" :placeholder="filedItem.placeholder"></u-input>
                </u-form-item>
                <u-form-item v-if="filedItem.type === '3'" class="cus-column" :required="filedItem.require" :label="filedItem.label" :prop="filedItem.label" label-width="auto">
                    <u-radio-group v-model="form[filedItem.label]" active-color="#0DC6C9">
                        <u-radio v-for="(valueItem, valueIndex) in filedItem.valueList" :key="valueItem.value" :name="valueItem.value" style="margin-right: 10px">{{ valueItem.value }}</u-radio>
                    </u-radio-group>
                </u-form-item>
                <u-form-item v-if="filedItem.type === '4'" class="cus-column" :required="filedItem.require" :label="filedItem.label" :prop="filedItem.label" label-width="auto">
                    <u-checkbox-group @change="checkboxGroupChange($event, filedItem)" active-color="#0DC6C9">
                        <u-checkbox v-model="valueItem.checked" v-for="(valueItem, valueIndex) in filedItem.valueList" :key="valueItem.value" :name="valueItem.value" style="margin-right: 10px">{{
                            valueItem.value
                        }}</u-checkbox>
                    </u-checkbox-group>
                </u-form-item>
            </template>

            <u-form-item label="审批流程" label-position="top" :label-width="200" class="border_top" v-if="timelineList.length > 0">
                <YSteps :showIndex="false" lineNum="0" color="#fff" backgroundColor="#DCDCDC" :infoList="timelineList" />
            </u-form-item>

            <u-form-item label="会议议题" :border-bottom="false" label-position="top" class="border_top agenda" v-if="form.agenda.length > 0">
                <view class="handel">
                    <image src="@/static/images/meeting/edit_icon.svg" class="edit_icon" @click="skipAgenda" />
                    <u-icon name="close" color="#9E9E9E" size="34" class="close_icon" @click="removeAgenda" />
                </view>
                <view class="sort">
                    <u-steps :list="agendaNumList" :current="100" mode="dot" direction="column" active-color="#DCDCDC"></u-steps>
                    <view class="agenda_list">
                        <view class="item" v-for="(item, i) in form.agenda" :key="i">
                            <view>{{ item.name }}</view>
                            <text>{{ item.start_time }}</text>
                        </view>
                    </view>
                </view>
            </u-form-item>

            <view v-if="isServe">
                <u-form-item label="会议服务" :label-width="200" :border-bottom="false" class="meeting_serve_title">
                    <u-input placeholder="" disabled />
                    <u-icon name="close" color="#9E9E9E" size="34" class="icon" @click="removeServe" />
                </u-form-item>
                <u-form-item prop="logistics" label="" :label-width="200" class="clear_box meeting_serve" :border-bottom="false">
                    <view class="clear_pro">
                        <view class="item" v-for="(item, i) in form.logistics.logistics_type" :key="item.id">
                            <view class="item_tit">
                                <image src="@/static/images/meeting/del_serve.svg" class="del_serve" @click="removeOneServe(item, i)" />
                                <text>{{ item.name }}</text>
                            </view>
                            <view class="count">
                                <u-icon name="close" color="##1E1E1E" size="22" class="close" />
                                <text>{{ item.num }}</text>
                            </view>
                        </view>
                        <view class="add_info" @click="serverModel = true">
                            <u-icon name="plus" color="#03C2C5" size="30" class="plus_circle" />
                            添加服务
                        </view>
                    </view>
                </u-form-item>
                <u-form-item label="备注" label-position="top">
                    <u-input v-model="form.logistics.remark" type="textarea" maxlength="-1" height="140" auto-height placeholder="请输入服务要求" />
                </u-form-item>
                <u-form-item :label="`会议服务人员(${form.logisticsUser.length})`" class="serve_user" :label-width="300" right-icon="arrow-right" :border-bottom="false" @click="skipServeUser">
                    <view class="user_item" v-for="(item, i) in form.logisticsUser" :key="item.id" v-show="i < 3">
                        <image v-if="item.avatar" :src="item.avatar.includes('http') ? item.avatar : _globalStore.imgUrl + item.avatar" class="add_icon" />
                        <image v-else src="@/static/images/meetingDetails/common_user.svg" class="add_icon" />
                    </view>
                </u-form-item>
            </view>
        </u-form>
        <view class="tab_box" :class="bottomTabList.length > 2 ? null : 'tab_box_length'" v-if="showBottomListTab">
            <template v-for="item in bottomTabList" :key="item.name">
                <view class="tab_box_item" @click="skipView(item.path, item.id)" v-if="item.show">
                    <image :src="item.url" />
                    <text>{{ item.name }}</text>
                </view>
            </template>
        </view>
        <view class="booline"></view>
        <view class="fixed_handel">
            <u-button hover-class="none" type="primary" @click="isModal = true" class="white_button">取消</u-button>
            <u-button hover-class="none" type="primary" @click="submitFn" class="green_button">{{ submitTxt }}</u-button>
        </view>
    </view>
    <u-modal v-model="isModal" cancel-color="#979797" confirm-color="#03C2C5" content="确定退出当前会议的编辑吗？" :show-title="false" show-cancel-button @confirm="cancelFn" />
    <u-modal v-model="isConModal" cancel-color="#979797" confirm-color="#03C2C5" :content="modalCon" :show-title="false" show-cancel-button @confirm="conflictFn" />
    <!-- serveSelect -->
    <view>
        <u-popup mode="bottom" v-model="serverModel">
            <serveSelect :list="serverList" @change="serverModelFn" @close="serverModel = false" />
        </u-popup>
    </view>
</template>

<script setup lang="ts">
    import { ref, reactive, onMounted, getCurrentInstance, watchEffect, computed, watch } from 'vue'
    import moment from 'moment'

    import { useRoute, useRouter } from 'vue-router'
    import { globalStore } from '@/store/modules/global'
    import { meetingStore } from '@/store/modules/meeting'
    import { meetingRoomSvr } from '@/api/modules/meetingRoomSvr'
    import { meetingSvr } from '@/api/modules/meetingSvr'
    import { meetingRoomStore } from '@/store/modules/meetingRoom'
    import Upload from '@components/upload/upload.vue'
    import TimeSelect from '@components/timeSelect/index.vue'
    import serveSelect from '@/pages/meeting/serve/index.vue'
    import YSteps from '@/components/Timeline/Y-Steps.vue'

    import { onHide, onUnload } from '@dcloudio/uni-app'
    const timePicker = reactive({
        confirmText: '下一步',
        cancelText: '取消',
        title: '开始时间'
    })

    const _meetingRoomStore = meetingRoomStore()
    const _meetingStore = meetingStore()
    const _meetingRoomSvr = new meetingRoomSvr()
    const _meetingSvr = new meetingSvr()
    const { proxy } = getCurrentInstance() //引入全局方法
    const _globalStore = globalStore()
    const route = useRoute()
    const isModal = ref<boolean>(false)
    const serverModel = ref<boolean>(false)
    const serverList = ref<Array<any>>([])
    const formRef = ref<any>()
    const leader = ref<Array<any>>([])
    const attendersArr = ref<Array<any>>([])
    const errorType = ref<any>(['toast'])
    const isConModal = ref<boolean>(false)
    const modalCon = ref<string>()
    const submitTxt = ref<string>()
    const errType = ref<number>()
    const isSelectTimeShow = ref<boolean>(false)
    const templateList = ref<any>([])

    // const roomId = route.query.room_id
    //如果有roomId 证明是从创建进入会议室的，需要把之前的内容再次填充
    const form = reactive<any>({
        subject: '',
        summary: '',
        room_id: '',
        room_name: '',
        time: '',
        start_time: '',
        end_time: '',
        leaders: <any>[],
        leadersList: <any>[],
        attenders: <any>[],
        attendersList: <any>[],
        agenda: <any>[],
        sms_start_time: <any>[],
        sms_type: <any>[],
        auto_record: 0,
        files: <any>[],
        externals: <any>[],
        old_meeting_id: 0,
        checkin: 0,
        meeting_type: <any>[],
        allow_checkin: 0,
        dynamic_qrcode: 0,
        cycleName: '',
        cycle_type: 0,
        skip_holiday: 0,
        cycle_end_date: '',
        force: 0,
        logisticsUser: <any>[],
        paperless_slogan: '',
        logisticsUserAuto: <any>[],
        conflict_force: 0,
        logistics: {
            logistics_type: <any>[], //会服类型
            logistics_user: <any>[], //会服人员
            // logistics_user_manual: [], //手动选择的服务人员
            remark: ''
        },
        template_id: '',
        template_name: '',
        template_data: <any>[],
        open_vcs_switch: false,
        vcs_live_password: '',
        scene: <any>[]
    })

    const uploadParams = reactive({
        url: `${proxy.$apiUrlFn()}/upload`,
        name: 'file'
    })

    const isShow1 = ref<boolean>(false)
    const isShow2 = ref<boolean>(false)
    const isShow3 = ref<boolean>(false)
    const isShow4 = ref<boolean>(false)
    const agendaNumList = ref<any>([])
    const timeSelectRef = ref<any>()
    const isUpdata = ref<any>(true)
    const meetingId = ref<any>()
    const meetingType = ref<any>() //copy抄送 2edit 编辑
    const isServe = ref<boolean>(false)
    const isDataShow = ref<boolean>(false)
    const timeParmas = ref<any>({
        year: true,
        month: true,
        day: true,
        hour: true,
        minute: true
    })
    const timeParmasStep = ref<any>({
        year: false,
        month: false,
        day: false,
        hour: true,
        minute: true
    })
    const accessoryList = ref<Array<any>>([])
    const checkboxList = ref<Array<any>>([
        { name: '应用通知', val: 2, checked: false },
        { name: '短信', val: 1, checked: false },
        { name: '邮件', val: 3, checked: false }
    ])
    const durationList = ref<Array<any>>([
        { val: 0, label: '准时' },
        { val: 10, label: '10分钟' },
        { val: 15, label: '15分钟' },
        { val: 20, label: '30分钟' },
        { val: 60, label: '提前1小时' },
        { val: 120, label: '提前2小时' }
    ])
    const bottomTabList = ref<Array<any>>([
        {
            id: 1,
            url: '/static/images/meeting/period.svg',
            name: '周期会议',
            path: '/pages/meeting/period',
            show: true
        },
        {
            id: 2,
            url: '/static/images/meeting/serve.svg',
            name: '会议服务',
            show: true
        },
        {
            id: 3,
            url: '/static/images/meeting/agenda.svg',
            name: '会议议题',
            path: '/pages/meeting/agenda/index',
            show: true
        },
        {
            id: 4,
            url: '/static/images/meeting/setting.svg',
            name: '高级设置',
            path: '/pages/meeting/setting/index',
            show: true
        }
    ])
    const week = ref<any>(['周一', '周二', '周三', '周四', '周五', '周六', '周天'])
    const cycleList = ref<Array<any>>([
        {
            name: '无',
            val: 0
        },
        {
            name: '每天',
            val: 1
        },
        {
            name: `每周（${week.value[moment(_meetingStore.start_time).format('E')]}）`,
            val: 2
        },
        {
            name: `每月（${moment(_meetingStore.start_time).format('D')}号）`,
            val: 3
        },
        {
            name: `每年（${moment(_meetingStore.start_time).format('M月D日')}）`,
            val: 4
        }
    ])

    const current = ref<number>(0)
    const date = ref<string>(moment().format('YYYY-MM-DD'))
    const timeArr = ref<any>({})

    const tabList = ref<Array<any>>([
        {
            name: '今天',
            val: moment().format('YYYY-MM-DD')
        },
        {
            name: '明天',
            val: moment().add(1, 'day').format('YYYY-MM-DD')
        },
        {
            name: '后天',
            val: moment().add(2, 'day').format('YYYY-MM-DD')
        },
        {
            name: '选择日期',
            val: `select`
        }
    ])
    const rules = ref<any>({
        subject: [
            {
                required: true,
                message: '请输入会议主题',
                trigger: ['blur', 'change']
            }
        ],
        room_name: [
            {
                required: true,
                message: '请选择会议室',
                trigger: ['change']
            }
        ],
        time: [
            {
                required: true,
                message: '请选择会议时间',
                trigger: ['change']
            }
        ]
    })
    const timelineList = ref<any[]>([])
    const templateShow = ref<any>(false)

    const detailCusFileds = ref<any>([])
    const detailData = ref<any>({})

    onMounted(() => {
        formRef.value.setRules(rules.value)
        getListMeetingTemplate()
    })

    //获取会服内容
    const serverListFn = () => {
        _meetingSvr.logisticsType(
            {
                search: '',
                page: 1,
                pageSize: 0
            },
            (res: any) => {
                let userIds: any[] = []
                res.forEach((item: any) => {
                    item.num = 1
                    item.check = 0
                    form.logistics.logistics_type.forEach((row: any) => {
                        if (item.id == row.id) {
                            item.check = 1
                            item.num = row.num
                            row.user = item.logistics_user
                            item.logistics_user.forEach((child: any) => {
                                userIds.push(child.id)
                            })
                        }
                    })
                })
                form.logisticsUser.forEach((item: any) => {
                    if (userIds.includes(item.id)) {
                        item.isBind = true
                    }
                })
                serverList.value = res
            },
            (err: any) => {
                proxy.$toast(err)
            }
        )
    }

    const getDetails = () => {
        _meetingSvr.meetingDetails(
            meetingId.value,
            (res: any) => {
                uni.hideLoading()
                _meetingStore.subject = res.subject
                _meetingStore.summary = res.summary
                _meetingStore.room_name = res.detail.room.name
                initId(res.detail.leader)
                initId(res.detail.attender)
                _meetingStore.leadersUserCreate = res.detail.leader
                _meetingStore.attendersUserCreate = res.detail.attender
                res.detail.files.forEach((item: any) => {
                    item.file_size = (item.file_size / 1024 / 1024).toFixed(2)
                })
                accessoryList.value = res.detail.files

                // 会议类型
                _meetingStore.template_id = res.template_id
                detailCusFileds.value = res.detail.template_data
                detailData.value = res

                if (meetingType.value == 'edit') {
                    // 1.无纸化会议 2.视频会议 3.录播会议
                    res.meeting_type.includes('2') ? (form.open_vcs_switch = true) : (form.open_vcs_switch = false)
                    form.vcs_live_password = res.vcs_live_password
                    _meetingStore.start_time = res.start_time_cut
                    _meetingStore.end_time = res.end_time_cut
                    _meetingStore.time = `${res.end_time_cut.split(' ')[0]} ${res.start_time_cut.split(' ')[1]}~${res.end_time_cut.split(' ')[1]}`
                    res.detail.agenda.forEach((item: any) => {
                        item.leader.id = item.leader.user_id
                        initId(item.attenders)
                    })
                    _meetingStore.agendaList = res.detail.agenda
                    checkboxList.value.forEach((item: any) => {
                        if (res.detail.sms.sms_type.includes(item.val)) {
                            item.checked = true
                        }
                    })
                    _meetingStore.sms_typeName = checkboxList.value
                    _meetingStore.sms_type = res.detail.sms.sms_type
                    _meetingStore.sms_start_time = res.detail.sms.sms_start_time
                    _meetingStore.checkin = res.checkin
                    _meetingStore.meeting_type = res.meeting_type
                    _meetingStore.allow_checkin = res.allow_checkin
                    _meetingStore.dynamic_qrcode = res.dynamic_qrcode
                    _meetingStore.scene = res.detail.scene
                    durationList.value.forEach((item: any) => {
                        if (item.val == _meetingStore.sms_start_time) {
                            _meetingStore.sms_start_time_str = item.label
                        }
                    })
                    _meetingStore.auto_record = res.auto_record
                    if (res.detail.external.length != 0) {
                        _meetingStore.externalTable = res.detail.external
                        _meetingStore.is_external = 1
                    }
                    //周期会议
                    if (res.meeting_cycle?.cycle_type) {
                        _meetingStore.cycle_type = res.meeting_cycle?.cycle_type
                        _meetingStore.skip_holiday = res.meeting_cycle.skip_holiday
                        _meetingStore.cycle_end_date = res.meeting_cycle.cycle_end_date
                        if (res.meeting_cycle.cycle_type == 1) {
                            _meetingStore.cycleName = '每天'
                        } else if (res.meeting_cycle.cycle_type == 2) {
                            _meetingStore.cycleName = `每周（${week.value[Number(moment(res.start_time).format('E')) - 1]}）`
                        } else if (res.meeting_cycle.cycle_type == 3) {
                            _meetingStore.cycleName = `每月（${moment(res.start_time).format('D')}号）`
                        } else if (res.meeting_cycle.cycle_type == 4) {
                            _meetingStore.cycleName = `每年（${moment(res.start_time).format('M月D日')}）`
                        }
                    }

                    //会议服务
                    if (res.logistics) {
                        form.logistics.logistics_type = res.logistics.logistics_type
                        isServe.value = true
                        form.logistics.remark = res.logistics.remark
                        form.logisticsUser = res.logistics.logistics_user
                        _meetingStore.logisticsInternal = []
                        _meetingStore.logisticsExternal = []
                        form.logisticsUser.forEach((item: any) => {
                            if (item.avatar) {
                                _meetingStore.logisticsInternal.push(item)
                            } else {
                                _meetingStore.logisticsExternal.push(item)
                            }
                        })
                    }
                }
                serverListFn()
                _meetingStore.room_id = res.room_id
            },
            (err: any) => {
                proxy.$toast(err)
            }
        )
    }
    //复制会议
    //只需复制第一个界面的数据 然后走创建接口
    if (_meetingStore.meetingId) {
        meetingId.value = _meetingStore.meetingId
        meetingType.value = _meetingStore.meetingType
        getDetails()
        submitTxt.value = '保存会议'
    } else {
        serverListFn()
        submitTxt.value = '发起会议'
    }

    //服务人员
    watchEffect(() => {
        form.logisticsUser = [..._meetingStore.logisticsInternal, ..._meetingStore.logisticsExternal]
    })

    const changeTime = () => {
        isSelectTimeShow.value = false
        getMeetingTime()
    }
    const getMeetingTime = () => {
        _meetingRoomSvr.getMeetingTime(
            {
                roomId: _meetingStore.room_id,
                date: date.value,
                meetingId: 0
            },
            (res: any) => {
                timeArr.value = res
                form.room_id = _meetingStore.room_id
                getFlowMeetingAudit()
            },
            (err: any) => {
                proxy.$toast(err)
            }
        )
    }

    const getFlowMeetingAudit = () => {
        _meetingRoomSvr.getFlowMeetingAudit(
            {
                room_id: _meetingStore.room_id
            },
            (res: any) => {
                isSelectTimeShow.value = true
                let newList = res?.list || []
                newList = newList.map((item: any) => {
                    if (item?.type === 'creator') {
                        return {
                            user_list: [
                                {
                                    id: 1,
                                    name: item.name,
                                    avatar: item.avatar
                                }
                            ],
                            ...item
                        }
                    }
                    return {
                        ...item,
                        isMore: false
                    }
                })
                timelineList.value = newList
            },
            (err: any) => {
                proxy.$toast(err)
            }
        )
    }

    const conDateFn = (e: any) => {
        date.value = `${e.year}-${e.month}-${e.day}`
        tabList.value[3].name = date.value
        getMeetingTime()
    }

    const tabClick = () => {
        if (current.value == 3) {
            isShow2.value = true
        }
    }
    const listchangeFn = (e: number) => {
        timeSelectRef.value.clearData()
        if (e == 3) {
            isShow2.value = true
        } else {
            date.value = tabList.value[e].val
            getMeetingTime()
        }
    }

    //移除周期会议
    const removePeriod = () => {
        _meetingStore.cycleName = ''
        _meetingStore.cycle_type = 0
        _meetingStore.skip_holiday = 0
        _meetingStore.cycle_end_date = ''
    }

    const imageInit = (data: any) => {
        if (data.length == 0) return
        data.forEach((item: any) => {
            item.avatar = item.avatar.includes('http') ? item.avatar : _globalStore.imgUrl + item.avatar
        })
    }
    watchEffect(() => {
        //议题
        if (_meetingStore.agendaList.length > 0) {
            agendaNumList.value = []
            form.agenda = _meetingStore.agendaList
            for (let i = 0; i < form.agenda.length; i++) {
                agendaNumList.value.push({ name: '' })
            }
        } else {
            form.agenda = []
            agendaNumList.value = []
        }
    })
    watchEffect(() => {
        form.leadersList = _meetingStore.leadersUserCreate
        form.attendersList = _meetingStore.attendersUserCreate
        imageInit(form.leadersList)
        imageInit(form.attendersList)
    })
    watchEffect(() => {
        if (_meetingStore.subject) {
            form.subject = _meetingStore.subject
        }
        form.summary = _meetingStore.summary
    })

    watchEffect(() => {
        form.time = _meetingStore.time
    })
    watchEffect(() => {
        if (_meetingStore.room_id && route.path.includes('meetingForm')) {
            getMeetingTime()
            form.room_name = _meetingStore.room_name
        }
    })

    watchEffect(() => {
        //会议文件
        if (accessoryList.value.length > 0) {
            accessoryList.value.forEach((item: any) => {
                _meetingStore.files.push({
                    file_name: item.file_name,
                    file_path: item.file_path
                })
            })

            form.files = accessoryList.value
        }
    })

    watchEffect(() => {
        form.cycleName = _meetingStore.cycleName
        form.cycle_type = _meetingStore.cycle_type
        form.skip_holiday = _meetingStore.skip_holiday
        form.cycle_end_date = _meetingStore.cycle_end_date
    })

    watchEffect(() => {
        form.template_name = _meetingStore.template_name
        form.template_id = _meetingStore.template_id
    })

    let temTimeY = ''
    let temTimeH = ''
    const conTimeFn1 = (e: any) => {
        temTimeY = `${e.year}-${e.month}-${e.day}`
        temTimeH = `${e.year}-${e.month}-${e.day} ${e.hour}:${e.minute}`
        isShow3.value = true
    }
    const conTimeFn3 = (e: any) => {
        form.time = temTimeH + `~${e.hour}:${e.minute}`
        _meetingStore.start_time = temTimeH
        _meetingStore.end_time = temTimeY + ` ${e.hour}:${e.minute}`
    }
    const conTimeFn = (e: any) => {
        form.cycle_end_date = `${e.year}-${e.month}-${e.day}`
    }
    const onOkFn = (startTime: any, endTime: any) => {
        if (!endTime) {
            _meetingStore.start_time = ''
            _meetingStore.end_time = ''
            form.time = ''
            return
        }
        _meetingStore.start_time = `${date.value} ${startTime}`
        _meetingStore.end_time = `${date.value} ${endTime}`
        form.time = `${date.value} ${startTime}~${endTime}`
        _meetingStore.time = `${date.value} ${startTime}~${endTime}`
    }

    const removeAccessory = (i: number) => {
        accessoryList.value.splice(i, 1)
    }

    const removeAgenda = () => {
        _meetingStore.agendaList = []
    }

    const onProgressAccessoryFn = (e: any) => {
        uni.showToast({
            title: `正在上传${e.progress}%`,
            icon: 'loading',
            duration: 100000
        })
        if (e.type == 'success') {
            accessoryList.value.push({
                file_name: e.name,
                file_size: (e.size / 1024 / 1024).toFixed(2),
                file_path: e.responseText.data.path,
                isImg: e.name.includes('.png') || e.name.includes('.jpg') || e.name.includes('.jepg') ? 1 : 0
            })
            proxy.$toast('上传成功')
        }
    }

    const skipUserTree = (type: number) => {
        isSelectTimeShow.value = false
        uni.navigateTo({
            url: `/pages/userTree/index?compere=${type}&path=create`
        })
    }
    const skipRoomList = () => {
        _meetingRoomStore.path = 'meetingForm'
        _meetingRoomStore.isFilter = false
        _meetingRoomStore.appoint_time = ''
        _meetingRoomStore.roomType = [-1]
        _meetingRoomStore.locationId = []
        _meetingRoomStore.date = ''
        _meetingRoomStore.capacity = []
        _meetingRoomStore.deviceType = []
        _meetingRoomStore.filter = {}
        _meetingStore.subject = form.subject
        _meetingStore.time = form.time
        _meetingStore.skip_holiday = form.skip_holiday
        _meetingStore.cycle_end_date = form.cycle_end_date
        _meetingStore.template_name = form.template_name
        _meetingStore.template_id = form.template_id
        isSelectTimeShow.value = false
        uni.navigateTo({
            url: `/pages/meetingRoom/index`
        })

        proxy.$initScroll()
    }

    const skipAgenda = () => {
        isSelectTimeShow.value = false
        uni.navigateTo({
            url: `/pages/meeting/agenda/index`
        })
    }

    const skipView = (path: string, id: number) => {
        // if(id == 3 && meetingType.value=='edit') {
        // 	uni.navigateTo({
        // 		url: path+`?id=${meetingId.value}`
        // 	});
        // }else {

        // }
        if (id == 1 && !form.time) return proxy.$toast('请先选择会议时间')
        if (path) {
            isSelectTimeShow.value = false
            uni.navigateTo({
                url: path
            })
            proxy.$initScroll()
        } else {
            isServe.value = true
        }
    }

    //服务人员
    const skipServeUser = () => {
        isSelectTimeShow.value = false
        uni.navigateTo({
            url: `/pages/meeting/serve/user`
        })
    }

    //清除服务
    const removeServe = () => {
        isServe.value = false
        form.logistics.logistics_type = []
        form.logistics.remark = ''
        _meetingStore.logisticsInternal = []
        _meetingStore.logisticsExternal = []
    }

    const removeOneServe = (row: any, i: number) => {
        form.logistics.logistics_type.splice(i, 1)
        let ids = form.logistics.logistics_type.map((v: any) => v.id)
        serverList.value.forEach((item: any) => {
            if (ids.includes(item.id)) {
                item.check = 1
            } else {
                item.check = 0
            }
        })

        let userId: any[] = []
        form.logistics.logistics_type.forEach((item: any) => {
            item.user.forEach((row: any) => {
                userId.push(row.id)
            })
        })

        row.user.forEach((item: any) => {
            form.logisticsUser.forEach((row: any, i: number) => {
                if (row.id == item.id && !userId.includes(row.id)) {
                    //删除之前还需看其他的服务中是有当前人员
                    form.logisticsUser.splice(i, 1)
                }
            })
        })
        _meetingStore.logisticsExternal = []
        _meetingStore.logisticsInternal = []
        if (form.logisticsUser.length > 0) {
            form.logisticsUser.forEach((item: any) => {
                if (item.id > 0) {
                    _meetingStore.logisticsInternal.push(item)
                } else {
                    _meetingStore.logisticsExternal.push(item)
                }
            })
        }
    }

    const serverModelFn = (row: any) => {
        form.logistics.logistics_type = row
        row.forEach((item: any) => {
            item.user.forEach((child: any) => {
                child.isBind = 1
                if (child.user_id) {
                    _meetingStore.logisticsInternal.push(child)
                    _meetingStore.logisticsInternal = proxy.$mapInitFn(_meetingStore.logisticsInternal)
                } else {
                    _meetingStore.logisticsExternal.push(child)
                    _meetingStore.logisticsExternal = proxy.$mapInitFn(_meetingStore.logisticsExternal)
                }
            })
        })
    }

    const cancelFn = () => {
        if (_meetingStore.path) {
            uni.reLaunch({
                url: _meetingStore.path
            })
            _meetingStore.path = ''
        } else {
            uni.reLaunch({
                url: '/pages/tabBar/myMetting/index'
            })
        }
        proxy.$initScroll()
        clearData()
    }

    const submitFn = () => {
        formRef.value.validate((valid: any) => {
            console.log('form', form)
            if (!valid) return
            if (_meetingStore.end_time) {
                form.start_time = _meetingStore.start_time + ':00'
                form.end_time = _meetingStore.end_time + ':00'
            }
            if (form.cycleName && !form.cycle_end_date) return proxy.$toast('请选择周期截止日期')
            if (template_content_object.value?.video?.checked && template_content_object.value?.video?.require && !form.open_vcs_switch) return proxy.$toast('请开启视频会议')
            if ((!form.cycleName || !form.cycle_end_date) && template_content_object.value?.cycle?.checked && template_content_object.value?.cycle?.require) return proxy.$toast('请输入会议周期')

            if (_meetingStore.agendaList.length > 0) {
                _meetingStore.agendaList.forEach((item: any) => {
                    item.leaderTmp = item.leader
                    if (Array.isArray(item.leader)) {
                        item.leader = item.leaderTmp[0].id
                    } else {
                        item.leader = item.leaderTmp?.id
                    }
                    item.attendersTmp = item.attenders
                    item.attenders = item.attendersTmp?.map((val: any) => val?.id)
                })
                form.agenda = _meetingStore.agendaList
            }
            if (form.agenda.length === 0 && template_content_object.value?.agenda?.checked && template_content_object.value?.agenda?.require) return proxy.$toast('请输入会议议题')

            form.sms_start_time = _meetingStore.sms_start_time
            form.sms_type = _meetingStore.sms_type
            form.auto_record = _meetingStore.auto_record
            form.checkin = _meetingStore.checkin
            form.meeting_type = _meetingStore.meeting_type
            if (_meetingStore.scene.length > 0) {
                form.scene = _meetingStore.scene
            }
            if (form.open_vcs_switch) {
                !form.meeting_type.includes('2') ? form.meeting_type.push('2') : null
            } else {
                let index = form.meeting_type.indexOf('2')
                index != -1 ? form.meeting_type.splice(index, 1) : null
            }
            form.allow_checkin = _meetingStore.allow_checkin
            form.dynamic_qrcode = _meetingStore.dynamic_qrcode
            form.files = accessoryList.value
            form.externals = _meetingStore.externalTable
            form.paperless_slogan = _meetingStore.paperless_slogan
            if (form.leadersList.length > 0) {
                form.leaders = form.leadersList.map((val: any) => val.id)
            }
            if (form.attendersList.length > 0) {
                form.attenders = form.attendersList.map((val: any) => val.id)
            }

            if (template_content_object.value?.service?.checked && template_content_object.value?.service?.require) {
                if (form.logistics?.logistics_user?.length == 0 && form.logistics?.logistics_type?.length == 0) {
                    return proxy.$toast('请添加会议服务')
                }
            }

            //会议服务
            if (form.logisticsUser.length == 0 && (form.logistics.remark || form.logistics.logistics_type.length != 0)) {
                return proxy.$toast('请选择会议服务人员')
            }

            if (form.logisticsUser.length > 0 && !form.logistics.remark && form.logistics.logistics_type.length == 0) {
                return proxy.$toast('请选择会议服务内容')
            }

            form.logistics.logistics_user = form.logisticsUser.map((item: any) => item.id)
            if (meetingType.value == 'copy') {
                form.old_meeting_id = Number(meetingType.value)
            }

            // 自定义模板
            if (form.template_data.length > 0) {
                const newTemplateDataValue = form.template_data.map((item: any) => {
                    if (item.type === '4') {
                        return {
                            ...item,
                            [item.label]: form[item.label].length > 0 ? form[item.label].split(',') : []
                        }
                    }
                    return { ...item, [item.label]: form[item.label] || '' }
                })
                form.template_data = newTemplateDataValue
            }
            uni.showLoading({ title: '加载中...', mask: true })
            let reqFn = _meetingSvr.addMeeting,
                msg = '会议室预约成功'
            if (meetingType.value == 'edit') {
                reqFn = _meetingSvr.updataMeeting
                msg = '会议室预约编辑成功'
            }

            reqFn(
                meetingId.value,
                form,
                (res: any) => {
                    uni.hideLoading()
                    proxy.$toast(msg)
                    if (meetingType.value == 'edit') {
                        uni.reLaunch({
                            url: _meetingStore.path
                        })
                        _meetingStore.path = ''
                    } else {
                        uni.reLaunch({
                            url: `/pages/tabBar/myMetting/index`
                        })
                    }
                    clearData()
                },
                (err: any, isConflict: number) => {
                    uni.hideLoading()
                    errType.value = isConflict
                    if (isConflict == 1) {
                        modalCon.value = err + `和待进行的会议时间冲突，确定继续邀请吗？`
                        isConModal.value = true
                    } else if (isConflict == 2) {
                        modalCon.value = err
                        isConModal.value = true
                    } else {
                        console.log(err)
                        uni.showToast({ title: err, icon: 'none' })
                    }
                    if (_meetingStore.agendaList.length > 0) {
                        _meetingStore.agendaList.forEach((item: any) => {
                            item.leader = item.leaderTmp
                            item.attenders = item.attendersTmp
                        })
                    }
                }
            )
        })
    }

    const conflictFn = () => {
        if (errType.value == 1) {
            form.force = 1
        } else if (errType.value == 2) {
            form.conflict_force = 1
        }
        submitFn()
    }

    const clearData = () => {
        _meetingStore.meetingId = ''
        _meetingStore.meetingType = ''
        _meetingStore.subject = ''
        _meetingStore.start_time = ''
        _meetingStore.agendaList = []
        _meetingStore.end_time = ''
        _meetingStore.room_id = ''
        form.room_id = ''
        _meetingStore.cycle_type = 0
        _meetingStore.cycleName = ''
        form.cycleName = ''
        form.logistics = {
            logistics_type: [],
            logistics_user: [],
            remark: ''
        }
        form.logisticsUser = []
        _meetingStore.summary = ''
        _meetingStore.room_name = ''
        _meetingStore.time = ''
        _meetingStore.leadersUserCreate = []
        _meetingStore.attendersUserCreate = []
        _meetingStore.sms_start_time = []
        _meetingStore.sms_type = []
        _meetingStore.auto_record = 0
        _meetingStore.files = []
        _meetingStore.externalTable = []
        accessoryList.value = []
        _meetingStore.logisticsInternal = []
        _meetingStore.logisticsExternal = []
        _meetingStore.checkin = 0
        _meetingStore.meeting_type = []
        _meetingStore.allow_checkin = 0
        _meetingStore.dynamic_qrcode = 0
        _meetingStore.cycleName = ''
        _meetingStore.cycle_type = 0
        _meetingStore.skip_holiday = 0
        _meetingStore.cycle_end_date = ''
        _meetingStore.sms_start_time = [15]
        _meetingStore.sms_start_time_str = '15分钟'
        _meetingStore.scene = [
            {
                type: 'before_meeting', // 会前场景
                scene_config_id: '', // 场景id
                scene_config_name: '',
                scene_on_time: '' // 场景开始时间
            },
            {
                type: 'after_meeting', // 会前场景
                scene_config_id: '', // 场景id
                scene_config_name: '',
                scene_on_time: '' // 场景开始时间
            }
        ]
    }
    const initId = (arr: any) => {
        arr.forEach((item: any) => {
            item.id = item.user_id
        })
    }
    // 获取模板
    const getListMeetingTemplate = () => {
        _meetingSvr.getListMeetingTemplate(
            (res: any) => {
                const list = res.list || []
                templateList.value = list
                // 添加默认
                if (!_meetingStore.meetingId) {
                    _meetingStore.template_id = list.length > 0 ? list[0].id : undefined
                }
                isDataShow.value = true
            },
            (err: any) => {
                proxy.$toast(err?.message ? err.message : err.toString())
            }
        )
    }

    const handleTemplate_content = (content: any) => {
        const objArr = Object.entries(content)
        const tempRules = rules.value
        objArr.map((item: any) => {
            const [key, value] = item
            const objRule: any = [
                {
                    required: value.require ? Boolean(value.require) : false,
                    message: `请输入${value.label}`,
                    trigger: ['blur', 'change']
                }
            ]
            if (key !== 'cusFileds' && value.require) {
                let newKey: any = key
                if (key === 'cycle') {
                    newKey = 'cycleName'
                } else if (key === 'leaders') {
                    newKey = 'leadersList'
                    objRule[0].trigger = 'change'
                    objRule[0].message = '请选择主持人'
                    objRule[0].type = 'array'
                } else if (key === 'attenders') {
                    newKey = 'attendersList'
                    objRule[0].trigger = 'change'
                    objRule[0].message = '请选择参会人'
                    objRule[0].type = 'array'
                } else if (key === 'video') {
                    newKey = 'open_vcs_switch'
                    objRule[0].trigger = 'change'
                    objRule[0].message = '请开启视频会议'
                    objRule[0].type = 'boolean'
                } else if (key === 'describe') {
                    newKey = 'summary'
                    objRule[0].message = '请输入会议内容'
                } else if (key === 'files') {
                    objRule[0].trigger = 'change'
                    objRule[0].message = '请上传附件'
                    objRule[0].type = 'array'
                }
                tempRules[newKey] = objRule
            }
        })
        console.log('objRule', tempRules)
        formRef.value.setRules(tempRules)
    }
    // 过滤 对应模板
    const template_content_object = computed(() => {
        if (form.template_id) {
            const tempObj = templateList.value.find((item: any) => item.id === form.template_id)
            console.log('tempObj', tempObj, form.template_id)
            if (tempObj) {
                _meetingStore.template_name = tempObj?.name || ''

                // 底部功能
                const tempBottom = bottomTabList.value
                bottomTabList.value = tempBottom.map((item: any) => {
                    item.show = false
                    if (
                        (item.name === '周期会议' && tempObj?.template_content?.cycle?.checked) ||
                        (item.name === '会议服务' && tempObj?.template_content?.service?.checked) ||
                        (item.name === '会议议题' && tempObj?.template_content?.agenda?.checked) ||
                        item.name === '高级设置'
                    ) {
                        item.show = true
                    }
                    if (item.name === '高级设置') {
                        const paperlessBool = tempObj?.template_content?.paperless?.checked
                        const recordedBool = tempObj?.template_content?.recorded?.checked
                        const signinBool = tempObj?.template_content?.signin?.checked
                        const scenarioBool = tempObj?.template_content?.scenario?.checked
                        item.path = `/pages/meeting/setting/index?paperless=${paperlessBool}&recorded=${recordedBool}&signin=${signinBool}&scenario=${scenarioBool}`
                    }
                    return item
                })
                const temp = tempObj ? tempObj.template_content : {}
                // 处理固定的模板字段-rules
                handleTemplate_content(temp)
                return temp
            }
        }
        return {}
    })

    // 是否显示bottomList
    const showBottomListTab = computed(() => {
        let flag = false
        bottomTabList.value.map((item: any) => {
            if (item.show) {
                flag = true
            }
        })
        return flag
    })

    // 过滤 自定义字段
    const newFiledList = computed(() => {
        if ((meetingType.value == 'edit' || meetingType.value == 'copy') && detailCusFileds.value?.length > 0) {
            if (form.template_id === detailData.value.template_id) {
                return detailCusFileds.value
            } else {
                return template_content_object.value?.cusFileds ? template_content_object.value?.cusFileds : []
            }
        } else {
            return template_content_object.value?.cusFileds ? template_content_object.value?.cusFileds : []
        }
    })

    // 赋值自定义字段
    watch([newFiledList, template_content_object], () => {
        if (meetingType.value == 'edit' || meetingType.value == 'copy') {
            form.template_data = newFiledList.value
        } else {
            form.template_data = newFiledList.value
                ? newFiledList.value.map((item: any) => {
                      if (item.type === '4') {
                          return {
                              ...item,
                              [item.label]: [],
                              valueList: item.valueList.map((vaItem: any) => ({ ...vaItem, checked: false }))
                          }
                      }
                      return { ...item, [item.label]: item.value || '' }
                  })
                : []
        }
        console.log('ooooo')
        if (form.template_data.length > 0) {
            const tempRules = rules.value
            form.template_data.map((item: any) => {
                const objRule = [
                    {
                        required: item.require,
                        message: item.type === '3' || item.type === '4' ? `请选择${item.label}` : `请输入${item.label}`,
                        trigger: item.type === '3' || item.type === '4' ? ['blur', 'change'] : ['blur']
                    }
                ]
                tempRules[item.label] = objRule
                // item.value 默认值   item[item.label] 编辑之后
                if (meetingType.value == 'edit' || meetingType.value == 'copy') {
                    if (item.type === '4') {
                        form[item.label] = item[item.label] ? item[item.label].join(',') : ''
                        item.valueList = item.valueList.map((valueItem: any) => {
                            valueItem.checked = false
                            if (Array.isArray(item[item.label]) && item[item.label].includes(valueItem.value)) {
                                valueItem.checked = true
                            }
                            return valueItem
                        })
                    } else {
                        form[item.label] = item[item.label]
                    }
                } else {
                    form[item.label] = item.type === '4' ? '' : item.value || ''
                }
            })
            formRef.value.setRules(tempRules)
            console.log('1')
            console.log(tempRules)
            console.log('2')
        }

        console.log('form.template_data', form.template_data)
    })

    const handleTemplateConfirm = (e: any) => {
        _meetingStore.template_id = e[0].value
    }

    const checkboxGroupChange = (val: any, row: any) => {
        form[row.label] = val.join(',')
    }
</script>

<style lang="scss">
    :deep(.uni-tabbar-bottom) {
        display: none;
    }
    .meeting_form {
        background: #fff;
        :deep(.u-form) {
            .u-form-item {
                margin: 0 32rpx;
                margin-left: 40rpx;
                background: #fff;
            }
            .cus-column {
                .u-form-item__body {
                    flex-direction: column !important;
                    .u-form-item--left {
                        flex: initial !important;
                    }
                    .u-radio-group,
                    .u-checkbox-group {
                        flex-direction: column;
                        flex: 1;
                        .u-radio {
                            height: 100rpx;
                            & + .u-radio {
                                border-top: 1px solid #f0f0f0;
                            }
                            .u-radio__label {
                                flex: 1;
                            }
                        }
                        .u-checkbox {
                            height: 100rpx;
                            & + .u-checkbox {
                                border-top: 1px solid #f0f0f0;
                            }
                            .u-checkbox__label {
                                flex: 1;
                            }
                        }
                    }
                }
            }
            .uni-input-wrapper {
                font-size: 32rpx;
            }
            .cus-text-input {
                .uni-input-wrapper {
                    text-align: left;
                }
            }
            .u-form-item--left {
                word-break: break-all;
            }
            .select_time {
                .u-icon {
                    font-size: 40rpx;
                    color: #979797;
                }
            }
            .select_time_block {
                .uni-scroll-view-content {
                    border-bottom: 2rpx solid #dcdcdc;
                }
                .time_info {
                    padding: 24rpx 38rpx;
                }
                .tip {
                    font-size: 20rpx;
                    color: #ff8a0d;
                    background: #feefdd;
                    border: 2rpx solid #ffefdd;
                    /* height: 52rpx; */
                    width: 100%;
                    display: flex;
                    align-items: center;
                    padding: 8rpx 17rpx;
                    /* white-space: nowrap; */
                    overflow: hidden;
                    border-radius: 80rpx;
                    margin-bottom: 24rpx;
                    image {
                        width: 28rpx;
                        height: 28rpx;
                        margin-right: 9rpx;
                    }
                }
                .u-tab-bar {
                    bottom: -6rpx;
                }
            }
            .add_icon,
            .user_item {
                width: 72rpx;
                height: 72rpx;
            }
            .border_top {
                margin: 0;
                padding-left: 32rpx;
                padding-right: 32rpx;
                border-top: 20rpx solid #f0f0f0;
            }
            .border_bottom {
                border-bottom: 20rpx solid #f2f2f2;
            }
            .user_box {
                display: flex;
                flex-wrap: wrap;
            }
            .user_item {
                margin-right: 29rpx;
                position: relative;
                .user_avatar {
                    width: 100%;
                    height: 100%;
                    border-radius: 6rpx;
                }
                .user_del {
                    display: block;
                    position: absolute;
                    top: 0;
                    right: 0;
                    transform: translate(50%, -50%);
                    z-index: 99;
                    width: 32rpx;
                    height: 32rpx;
                }
                .u-icon {
                }
            }
            .user_item_no_margin {
                .user_item {
                    margin-bottom: 0;
                }
            }
            .video_item {
                margin: 0 32rpx;
                .u-form-item--right__content__slot {
                    justify-content: flex-end;
                }
            }
            .uni-textarea-textarea {
                font-size: 32rpx;
            }

            .accessory {
                line-height: initial;
                padding: 28rpx 0;
                position: relative;
                .u-form-item--right__content__slot {
                    display: block;
                }
                .file_box {
                    position: absolute;
                    right: 0;
                    top: 16rpx;
                }
                .plus_circle {
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                }

                .item_info {
                    position: relative;
                    border-bottom: 2rpx solid #e4e7ed;
                    display: flex;
                    align-items: center;
                    padding: 44rpx 0;
                    &:last-of-type {
                        padding-bottom: 20rpx;
                        border: 0;
                    }
                    image {
                        width: 72rpx;
                        height: 72rpx;
                    }
                    .desc {
                        position: relative;
                        width: 100%;
                        font-size: 32px;
                        padding-left: 22rpx;
                        view {
                            &:first-of-type {
                                max-width: 500rpx;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                            }
                            /* line-height: 100rpx; */
                        }
                        text {
                            font-size: 24rpx;
                            color: #9e9e9e;
                        }
                    }
                    .close_icon {
                        position: absolute;
                        right: 0;
                        top: 50%;
                        transform: translateY(-50%);
                    }
                }
            }
            .agenda {
                position: relative;
                line-height: initial;
                padding: 28rpx 32rpx;
                .handel {
                    position: absolute;
                    right: 32rpx;
                    top: 32rpx;
                    display: flex;
                    align-items: center;
                    .edit_icon {
                        width: 32rpx;
                        height: 32rpx;
                        margin-right: 24rpx;
                    }
                    .close_icon {
                        /* margin-left: 20rpx; */
                    }
                }
                .u-steps {
                    position: absolute;
                    top: 88rpx;
                    left: 47rpx;
                }
                .u-steps .u-steps__item--column {
                    min-height: 114rpx !important;
                }
                .u-steps .u-steps__item--column .u-steps__item__line {
                    position: absolute;
                    z-index: 0;
                    height: 83%;
                    top: 58%;
                }
                .u-steps__item__dot {
                    width: 12rpx;
                    height: 12rpx;
                    margin-left: 4rpx;
                }
                .u-line {
                    border-color: #dcdcdc !important;
                }
                .agenda_list {
                    padding-left: 97rpx;
                    padding-top: 40rpx;
                    .item {
                        height: 114rpx;
                    }
                    view {
                        font-size: 28rpx;
                        text {
                            font-size: 24rpx;
                            color: #9e9e9e;
                        }
                    }
                }
            }

            .clear_box {
                .clear_pro {
                    width: 100%;
                    .item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        width: 100%;
                        font-size: 32rpx;
                        padding-bottom: 20rpx;
                        .count {
                            display: flex;
                            align-items: center;
                            .close {
                                padding-top: 2rpx;
                            }
                        }
                    }
                }
            }
            .meeting_serve_title {
                border-top: 20rpx solid #f0f0f0;
                margin: 0;
                padding-left: 32rpx;
                padding-right: 32rpx;
            }
            .meeting_serve {
                border-top: 2rpx solid #f0f0f0;
                .add_info {
                    text-align: center;
                    border: 2rpx dashed #bbbbbb;
                    border-radius: 100rpx;
                    height: 72rpx;
                    line-height: 72rpx;
                    text {
                        padding-top: 10rpx;
                        font-size: 24rpx;
                        color: #7e7e7e;
                    }
                }
                .del_serve {
                    width: 34rpx;
                    height: 34rpx;
                }
                .item {
                    &:last-of-type {
                        padding-bottom: 0;
                    }
                }
                .item_tit {
                    display: flex;
                    align-items: center;

                    text {
                        font-size: 30rpx;
                        padding-left: 16rpx;
                    }
                }
            }
            .serve_user {
                .u-form-item--right__content__slot {
                    justify-content: flex-end;
                    image {
                        width: 72rpx;
                        height: 72rpx;
                        border-radius: 6rpx;
                        margin-right: 29rpx;
                    }
                }
            }
            .period {
                .uni-input-input {
                    text-align: right;
                    padding-right: 36rpx;
                }
                .u-form-item--right__content__slot {
                    justify-content: flex-end;
                }
            }
        }
        .tab_box {
            border-top: 20rpx solid #f0f0f0;
            display: flex;
            padding: 31rpx 55rpx;
            justify-content: space-between;
            background: #fff;
            view {
                image {
                    width: 36rpx;
                    height: 36rpx;
                    display: block;
                    margin: 0 auto;
                }
                text {
                    padding-top: 14rpx;
                    text-align: center;
                    font-size: 20rpx;
                    color: #7e7e7e;
                }
            }
        }
        .tab_box_length {
            justify-content: left;
            .tab_box_item {
                & + .tab_box_item {
                    margin-left: 85rpx;
                }
            }
        }
        .booline {
            height: 150rpx;
            background: #f0f0f0;
        }
        .fixed_handel {
            display: flex;
            align-items: center;
            position: fixed;
            bottom: 0;
            width: 100%;
            background: #fff;
            height: 130rpx;
            /* border-top: 2rpx solid #f2f2f2; */
            z-index: 999;
            .u-btn {
                margin: 0 40rpx;
                padding: 0;
                border-radius: 100rpx;
                width: 320rpx;
                height: 76rpx;
                line-height: 106rpx;
                font-size: 32rpx;
            }
        }
    }
</style>
