'use client'

import type { HomeCommunityStats } from '@/lib/data/queries'
import {
  getHomeModules,
  type HomeModuleContext,
} from '@/lib/branding/home-modules.config'
import { ModuleTile } from '@/components/home/module-tile'
import type { ThirdModule } from '@/lib/modules'
import type { UserType } from '@/types/auth'

type ModulesSectionProps = {
  stats: HomeCommunityStats
  isLoggedIn: boolean
  userType: UserType | null
  third: ThirdModule
}

export function ModulesSection({ stats, isLoggedIn, userType, third }: ModulesSectionProps) {
  const ctx: HomeModuleContext = { isLoggedIn, userType, third }
  const modules = getHomeModules(ctx)

  return (
    <section id="modulos" className="scroll-mt-20 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <h3 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          ¿Qué puedes hacer en Kany?
        </h3>
        <p className="mt-3 text-base leading-relaxed text-foreground/60">
          Elige un módulo para reportar, donar o conectar con servicios locales.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod, i) => (
          <ModuleTile
            key={mod.id}
            module={mod}
            stats={stats}
            ctx={ctx}
            index={i}
          />
        ))}
      </div>
    </section>
  )
}
