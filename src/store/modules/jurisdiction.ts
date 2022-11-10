import { defineStore } from 'pinia';
import { store } from '@/store';

interface jurisdictionState {
    // 当前标签所在位置
    userActiveName: string
	adminActiveName: string
	isSuper: boolean,
	groupId: number,
	path_u_id: Array<any>,
	path_a_id: Array<any>,
}

export const jurisdictionStore = defineStore({
    id: 'jurisdictionStore',
    state: (): jurisdictionState => ({
        userActiveName: 'table',
        adminActiveName: 'table',
		isSuper: false,
		groupId: -1,
		path_u_id: [],
		path_a_id: [],
    }),
    getters: {
    },
    actions: {
    },
});

// Need to be used outside the setup
export function useUserStoreWithOut() {
    return jurisdictionStore(store);
}
