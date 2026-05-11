"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { UserModel } from "@/models/user/user.response";
import { getUsersService } from "@/services/dashboard/user/user.service";

interface UserComboboxProps {
    selectedUser: UserModel | null;
    onSelect: (user: UserModel | null) => void;
    placeholder?: string;
}

export function UserCombobox({
    selectedUser,
    onSelect,
    placeholder = "Select user...",
}: UserComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [users, setUsers] = React.useState<UserModel[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [search, setSearch] = React.useState("");

    React.useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                // @ts-ignore - The service expects AllUserReq but might return something different than what we expect if we don't cast or check
                const response: any = await getUsersService({
                    pageNo: 1,
                    pageSize: 50,
                    search: search,
                });

                // Handle different response structures just in case
                if (response && Array.isArray(response.content)) {
                    setUsers(response.content);
                } else if (Array.isArray(response)) {
                    setUsers(response);
                } else {
                    setUsers([]);
                }
            } catch (error) {
                console.error("Failed to fetch users", error);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedUser ? selectedUser.fullName : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search user..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        {loading && (
                            <div className="py-6 text-center text-sm">Loading...</div>
                        )}
                        {!loading && users.length === 0 && (
                            <CommandEmpty>No user found.</CommandEmpty>
                        )}
                        <CommandGroup>
                            {users.map((user) => (
                                <CommandItem
                                    key={user.id}
                                    value={user.id.toString()}
                                    onSelect={() => {
                                        onSelect(user);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {user.fullName} ({user.email})
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
