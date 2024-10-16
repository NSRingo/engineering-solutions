import Tooltip from 'rc-tooltip';
import type { TooltipProps } from 'rc-tooltip/lib/Tooltip';

import './popover.scss';

export const Popover: React.FC<TooltipProps> = ({ ...rest }) => {
  return <Tooltip {...rest} />;
};
