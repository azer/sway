defmodule SwayWeb.SchemaMap do
  def find_by_name(name) do
    case name do
      "users" -> {:users, Sway.Accounts.User, SwayWeb.UserView}
      "rooms" -> {:rooms, Sway.Rooms.Room, SwayWeb.RoomView}
      "workspaces" -> {:workspaces, Sway.Workspaces.Workspace, SwayWeb.WorkspaceView}
      "statuses" -> {:statuses, Sway.Statuses.Status, SwayWeb.StatusView}
      "private_members" -> {:private_members, Sway.Rooms.PrivateMember, SwayWeb.PrivateMemberView}
      _ -> raise ArgumentError, "Invalid schema name:" <> name
    end
  end
end
