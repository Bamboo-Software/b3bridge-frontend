import { NavLink } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  HomeIcon,
  SquareArrowUpIcon,
  Projector,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils';
import { routesPaths } from '@/utils/constants/routes';
import Image from '../ui/image';
import LaunchPadLogo from "@/assets/icons/launch-pad-logo.svg"
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onCollapse?: (collapsed: boolean) => void;
}

const { ROOT, BRIDGE, CREATE_TOKEN, LAUNCH_PAD, CREATE_LAUNCH_PAD } = routesPaths;

export function Sidebar({ className, onCollapse }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
    const [openSubMenu, setOpenSubMenu] = useState<number | null>(null);

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapse) {
      onCollapse(newCollapsedState);
    }
  };

  const sidebarItems = [
    {
      title: 'Home',
      icon: <HomeIcon className='h-4 w-4' />,
      href: ROOT,
    },
    {
      title: 'Bridge',
      icon: <SquareArrowUpIcon className='h-4 w-4' />,
      href: BRIDGE,
    },
    {
      title: 'Create Token',
      icon: <Projector className='h-4 w-4' />,
      href: CREATE_TOKEN,
    },
    {
      title: 'Launchpads',
      icon: <Image src={LaunchPadLogo} alt='Launchpads' className='h-4 w-4' />,
      children: [
        {
          title: 'Create Launchpads',
          icon:null,
          href:  CREATE_LAUNCH_PAD,
        },
        {
          title: 'Launchpad List',
          icon:null,
          href: LAUNCH_PAD,
        },
      ],
    },
  ];

  return (
    <div
      className={cn(
        'flex flex-col h-full transition-all duration-300',
        isCollapsed ? 'w-18' : 'w-64',
        className
      )}
    >
      <div className='flex-1 relative'>
        <div
          className={`absolute transition-all duration-300 top-1/2 -translate-y-1/2 ${
            isCollapsed ? 'left-14' : 'left-60'
          }  z-10 flex flex-col gap-2`}
        >
          <Button
            variant='ghost'
            size='icon'
            className={cn(
              'size-8 rounded-full p-0 shadow-md',
              'bg-gray-200 dark:bg-gray-800',
              'text-gray-700 dark:text-gray-200',
              'hover:bg-gray-300 dark:hover:bg-gray-700'
            )}
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className='size-4' />
            ) : (
              <ChevronLeft className='size-4' />
            )}
          </Button>
        </div>

        <div className='space-y-4 py-4'>
          <div className='px-4 py-2 border-t '>
            <div className='space-y-1'>
              {sidebarItems.map((item, idx) => {
                const hasChildren = item.children && item.children.length > 0;
                const isOpen = openSubMenu === idx;

                return (
                  <div key={item.title}>
                    {item.href ? (
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
                            isCollapsed && 'justify-center p-2'
                          )
                        }
                        title={isCollapsed ? item.title : ''}
                      >
                        <span
                          className={cn(
                            'h-4 w-4',
                            isCollapsed ? 'mx-auto' : 'mr-2'
                          )}
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && item.title}
                      </NavLink>
                    ) : (
                      <button
                        onClick={() => setOpenSubMenu(isOpen ? null : idx)}
                        className={cn(
                          'flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
                          isCollapsed && 'justify-center p-2'
                        )}
                        title={isCollapsed ? item.title : ''}
                      >
                        <span
                          className={cn(
                            'h-4 w-4',
                            isCollapsed ? 'mx-auto' : 'mr-2'
                          )}
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <>
                            <span className='flex-1 text-left'>
                              {item.title}
                            </span>
                            <ChevronRight
                              className={cn(
                                'h-4 w-4 transition-transform',
                                isOpen && 'rotate-90'
                              )}
                            />
                          </>
                        )}
                      </button>
                    )}

                    {!isCollapsed && hasChildren && isOpen && (
                      <div className='ml-8 mt-1 space-y-1'>
                        {item.children!.map((child) => (
                          <NavLink
                            key={child.href}
                            to={child.href!}
                            end={child.href === LAUNCH_PAD}
                            className={({ isActive }) =>
                              cn(
                                'flex items-center rounded-md px-3 py-1.5 text-sm transition-colors',
                                isActive
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                              )
                            }
                          >
                            {child.icon && (
                              <span className='mr-2'>{child.icon}</span>
                            )}
                            {child.title}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
