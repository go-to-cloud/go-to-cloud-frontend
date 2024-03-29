import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import type { App } from 'vue'
import { Layout } from '@/utils/routerHelper'
import { useI18n } from '@/hooks/web/useI18n'
import { AuthCodes } from '@/api/constants/auths'

const { t } = useI18n()

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    // redirect: '/dashboard/workplace',
    redirect: '/projects/index',
    name: 'Root',
    meta: {
      hidden: true,
      authCode: AuthCodes.MainMenuProject
    }
  },
  {
    path: '/monitor/:id/pods',
    component: () => import('@/views/Monitor/PodsView.vue'),
    name: 'MonitorPodsView',
    meta: {
      hidden: true,
      authCode: AuthCodes.MainMenuMonitor
    }
  },
  {
    path: '/projects/artifacts/:id',
    component: () => import('@/views/Projects/Artifacts/Index.vue'),
    name: 'ProjectArtifact',
    meta: {
      hidden: true,
      authCode: AuthCodes.ResProjectArtifacts
    }
  },
  {
    path: '/projects/ci/:id',
    component: () => import('@/views/Projects/CI/Index.vue'),
    name: 'ProjectCI',
    meta: {
      hidden: true,
      authCode: AuthCodes.ResProjectCI
    }
  },
  {
    path: '/projects/cd/:id',
    component: () => import('@/views/Projects/CD/Index.vue'),
    name: 'ProjectCD',
    meta: {
      hidden: true,
      authCode: AuthCodes.ResProjectCD
    }
  },
  {
    path: '/projects/codes/:id',
    component: () => import('@/views/Projects/Codes/Index.vue'),
    name: 'ProjectCode',
    meta: {
      hidden: true,
      authCode: AuthCodes.ResProjectSourceCode
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
        meta: {
          authCode: 0
        }
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true,
      authCode: 0
    }
  },
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
    name: 'Login',
    meta: {
      hidden: true,
      title: t('router.login'),
      noTagsView: true,
      authCode: 0
    }
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFind',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true,
      authCode: 0
    }
  }
]

export const asyncRouterMap: AppRouteRecordRaw[] = [
  // {
  //   path: '/dashboard',
  //   component: Layout,
  //   meta: {},
  //   name: 'Dashboard',
  //   children: [
  //     {
  //       path: 'workplace',
  //       component: () => import('@/views/Dashboard/Workplace.vue'),
  //       name: 'Workplace',
  //       meta: {
  //         title: t('router.workplace'),
  //         icon: 'ant-design:dashboard-filled',
  //         noCache: true
  //       }
  //     }
  //   ]
  // },
  {
    path: '/projects',
    component: Layout,
    meta: {
      authCode: AuthCodes.MainMenuProject
    },
    name: 'Projects',
    children: [
      {
        path: 'index',
        component: () => import('@/views/Projects/Project.vue'),
        name: 'ProjectIndex',
        meta: {
          title: t('router.projects'),
          icon: 'game-icons:over-infinity',
          authCode: AuthCodes.MainMenuProject
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
      alwaysShow: true,
      authCode: AuthCodes.MainMenuConfigure
    },
    children: [
      {
        path: 'coderepo',
        component: () => import('@/views/Configure/CodeRepo.vue'),
        name: 'CodeRepo',
        meta: {
          title: t('router.coderepo'),
          authCode: AuthCodes.SubMenuConfigureCodeRepo
        }
      },
      {
        path: 'builder',
        component: () => import('@/views/Configure/Builders.vue'),
        name: 'Builders',
        meta: {
          title: t('router.builders'),
          authCode: AuthCodes.SubMenuConfigureBuildNode
        }
      },
      {
        path: 'artifacts',
        component: () => import('@/views/Configure/Artifacts.vue'),
        name: 'Artifacts',
        meta: {
          title: t('router.artifacts'),
          authCode: AuthCodes.SubMenuConfigureArtifactRepo
        }
      },
      {
        path: 'kubernetes',
        component: () => import('@/views/Configure/Kubernetes.vue'),
        name: 'Kubernetes',
        meta: {
          title: t('router.k8s'),
          authCode: AuthCodes.SubMenuConfigureDeployRepo
        }
      }
    ]
  },
  // {
  //   path: '/pipelines',
  //   component: Layout,
  //   name: 'Pipelines',
  //   meta: {
  //     title: t('router.pipelines'),
  //     icon: 'ic:outline-webhook',
  //     alwaysShow: true
  //   },
  //   children: [
  //     {
  //       path: 'pipeline',
  //       component: () => import('@/views/Pipelines/Index.vue'),
  //       name: 'Pipeline',
  //       meta: {
  //         title: t('router.approach')
  //       }
  //     }
  //   ]
  // },
  {
    path: '/monitor',
    component: Layout,
    meta: {
      authCode: AuthCodes.MainMenuMonitor
    },
    name: 'Monitor',
    children: [
      {
        path: 'apps',
        component: () => import('@/views/Monitor/Apps.vue'),
        name: 'Apps',
        meta: {
          title: t('router.monitor'),
          icon: 'ic:outline-screenshot-monitor',
          authCode: AuthCodes.MainMenuMonitor
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
      alwaysShow: true,
      authCode: AuthCodes.MainMenuUsers
    },
    children: [
      {
        path: 'user',
        component: () => import('@/views/Authorization/User.vue'),
        name: 'User',
        meta: {
          title: t('router.user'),
          authCode: AuthCodes.SubMenuUser
        }
      },
      // {
      //   path: 'role',
      //   component: () => import('@/views/Authorization/Role.vue'),
      //   name: 'Role',
      //   meta: {
      //     title: t('router.role')
      //   }
      // },
      {
        path: 'org',
        component: () => import('@/views/Authorization/Org.vue'),
        name: 'Org',
        meta: {
          title: t('router.org'),
          authCode: AuthCodes.SubMenuOrgs
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
