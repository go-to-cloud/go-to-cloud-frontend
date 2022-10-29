import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import type { App } from 'vue'
import { Layout } from '@/utils/routerHelper'
import { useI18n } from '@/hooks/web/useI18n'

const { t } = useI18n()

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/projects/artifacts/:id',
    component: () => import('@/views/Projects/Artifacts/Index.vue'),
    name: 'ProjectCode',
    meta: {
      hidden: true
    }
  },
  {
    path: '/projects/codes/:id',
    component: () => import('@/views/Projects/Codes/Index.vue'),
    name: 'ProjectCode',
    meta: {
      hidden: true
    }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard/workplace',
    name: 'Root',
    meta: {
      hidden: true
    }
  },
  {
    path: '/redirect',
    component: Layout,
    name: 'Redirect',
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/views/Redirect/Redirect.vue'),
        meta: {}
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true
    }
  },
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
    name: 'Login',
    meta: {
      hidden: true,
      title: t('router.login'),
      noTagsView: true
    }
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFind',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  }
]

export const asyncRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/dashboard',
    component: Layout,
    meta: {},
    name: 'Dashboard',
    children: [
      {
        path: 'workplace',
        component: () => import('@/views/Dashboard/Workplace.vue'),
        name: 'Workplace',
        meta: {
          title: t('router.workplace'),
          icon: 'ant-design:dashboard-filled',
          noCache: true
        }
      }
    ]
  },
  {
    path: '/projects',
    component: Layout,
    meta: {},
    name: 'Projects',
    children: [
      {
        path: 'index',
        component: () => import('@/views/Projects/Project.vue'),
        name: 'Projects',
        meta: {
          title: t('router.projects'),
          icon: 'clarity:document-solid'
        }
      }
    ]
  },
  {
    path: '/configure',
    component: Layout,
    name: 'Configure',
    meta: {
      title: t('router.configure'),
      icon: 'bx:bxs-component',
      alwaysShow: true
    },
    children: [
      {
        path: 'coderepo',
        component: () => import('@/views/Configure/CodeRepo.vue'),
        name: 'CodeRepo',
        meta: {
          title: t('router.coderepo')
        }
      },
      {
        path: 'artifacts',
        component: () => import('@/views/Configure/Artifacts.vue'),
        name: 'Artifacts',
        meta: {
          title: t('router.artifacts')
        }
      },
      {
        path: 'kubernetes',
        component: () => import('@/views/Configure/Kubernetes.vue'),
        name: 'Kubernetes',
        meta: {
          title: t('router.k8s')
        }
      }
    ]
  },
  {
    path: '/pipelines',
    component: Layout,
    name: 'Pipelines',
    meta: {
      title: t('router.pipelines'),
      icon: 'ic:outline-webhook',
      alwaysShow: true
    },
    children: [
      {
        path: 'pipeline',
        component: () => import('@/views/Pipelines/Index.vue'),
        name: 'Pipeline',
        meta: {
          title: t('router.approach')
        }
      }
    ]
  },
  {
    path: '/monitor',
    component: Layout,
    meta: {},
    name: 'Monitor',
    children: [
      {
        path: 'apps',
        component: () => import('@/views/Monitor/Apps.vue'),
        name: 'Apps',
        meta: {
          title: t('router.monitor'),
          icon: 'clarity:document-solid'
        }
      }
    ]
  },
  {
    path: '/authorization',
    component: Layout,
    redirect: '/authorization/user',
    name: 'Authorization',
    meta: {
      title: t('router.authorization'),
      icon: 'eos-icons:role-binding',
      alwaysShow: true
    },
    children: [
      {
        path: 'user',
        component: () => import('@/views/Authorization/User.vue'),
        name: 'User',
        meta: {
          title: t('router.user')
        }
      },
      {
        path: 'role',
        component: () => import('@/views/Authorization/Role.vue'),
        name: 'Role',
        meta: {
          title: t('router.role')
        }
      }
    ]
  },
  {
    path: '/demo',
    component: Layout,
    meta: {},
    name: 'Demo',
    children: [
      {
        path: 'index',
        component: () => import('@/views/Demo/Demo.vue'),
        name: 'Demo',
        meta: {
          title: '测试',
          icon: 'clarity:document-solid'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes: constantRouterMap as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export const resetRouter = (): void => {
  const resetWhiteNameList = ['Redirect', 'Login', 'NoFind', 'Root']
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !resetWhiteNameList.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router
