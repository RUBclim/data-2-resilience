import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
import Item from './dropdown-menu-item.svelte';
import Content from './dropdown-menu-content.svelte';
import Separator from './dropdown-menu-separator.svelte';

const Root = DropdownMenuPrimitive.Root;
const Trigger = DropdownMenuPrimitive.Trigger;
const Group = DropdownMenuPrimitive.Group;

export {
	Root,
	Item,
	Group,
	Trigger,
	Content,
	Separator,
	//
	Root as DropdownMenu,
	Item as DropdownMenuItem,
	Group as DropdownMenuGroup,
	Content as DropdownMenuContent,
	Trigger as DropdownMenuTrigger,
	Separator as DropdownMenuSeparator
};
