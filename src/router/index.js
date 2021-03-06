import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/views/layout/Layout'

/* Router Modules */

/** note: submenu only apppear when children.length>=1
 *  detail see  https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 **/

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    roles: ['admin','editor']     will control the page roles (you can set multiple roles)
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
    noCache: true                if true ,the page will no be cached(default is false)
  }
**/
export const constantRouterMap = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/authredirect',
    component: () => import('@/views/login/authredirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/errorPage/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/errorPage/401'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'dashboard', icon: 'dashboard', noCache: true }
      }
    ]
  }
]

export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

// member
export const asyncRouterMap = [
  {
    path: '/application',
    component: Layout,
    meta : { roles: ['member'] },
    children: [
      {
        path: 'member',
        component: () => import('@/views/application/member'),
        name: 'Application',
        meta: {
          title: 'application',
          icon: 'link',
        }
      }
    ]
  },
  {
    path: '/buy',
    component: Layout,
    meta : { roles: ['member'] },
    children: [
      {
        path: 'member',
        component: () => import('@/views/application/memberbuy'),
        name: 'Buy',
        meta: {
          title: 'memberbuy',
          icon: 'shoppingCard',
        }
      }
    ]
  },
  {
    path: '/my-warehouse-receipt',
    component: Layout,
    meta : { roles: ['member'] },
    children: [
      {
        path: 'member',
        component: () => import('@/views/my-warehouse-receipt/member'),
        name: 'MyWarehouseReceipt',
        meta: {
          title: 'myWarehouseReceipt',
          icon: 'documentation',
        }
      }
    ]
  },
  {
    path: '/my-client',
    component: Layout,
    meta : { roles: ['member'] },
    children: [
      {
        path: 'member',
        component: () => import('@/views/my-client/member'),
        name: 'MyClient',
        meta: {
          title: 'myClient',
          icon: 'peoples',
        }
      }
    ]
  },
  // bank
  {
    path: '/application',
    component: Layout,
    meta : { roles: ['bank'] },
    children: [
      {
        path: 'bank',
        component: () => import('@/views/application/bank'),
        name: 'Application',
        meta: {
          title: 'checkList',
          icon: 'link'
        }
      }
    ]
  },
  {
    path: '/my-client',
    component: Layout,
    meta : { roles: ['bank'] },
    children: [
      {
        path: 'bank',
        component: () => import('@/views/my-client/bank'),
        name: 'MyClient',
        meta: {
          title: 'myClient',
          icon: 'peoples',
        }
      }
    ]
  },
  // storage
  {
    path: '/warehouse-receipt-handle',
    component: Layout,
    meta : { roles: ['storage'] },
    children: [
      {
        path: 'storage',
        component: () => import('@/views/warehouse-receipt-handle/storage'),
        name: 'WarehouseReceiptHandle',
        meta: {
          title: 'receiptHandle',
          icon: 'nested',
        }
      }
    ]
  },
  // exchange
  {
    path: '/application',
    component: Layout,
    meta : { roles: ['exchange'] },
    children: [
      {
        path: 'exchange',
        component: () => import('@/views/application/exchange'),
        name: 'Application',
        meta: {
          title: 'checkList',
          icon: 'link'
        }
      }
    ]
  },
  {
    path: '/my-member',
    component: Layout,
    meta : { roles: ['exchange'] },
    children: [
      {
        path: 'exchange',
        component: () => import('@/views/my-member/exchange'),
        name: 'MyMember',
        meta: {
          title: 'myMember',
          icon: 'peoples',
        }
      }
    ]
  },
  // origin

  { path: '*', redirect: '/404', hidden: true }
]
