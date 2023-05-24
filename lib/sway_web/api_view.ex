defmodule SwayWeb.APIView do
  def link(record, view) do
    %{
      id: record.id,
      view: view,
      data: record
    }
  end

  def row(row, schema) do
    %{
      id: row.id,
      schema: schema,
      data: row
    }
  end

  def links(schema, view, items) do
    if is_list(items) do
      render_links(init_link_map(init_resp(schema, view, items)))
    else
      render_links(init_link_map(init_resp(schema, view, [items])))
    end
  end

  def init_resp(schema, view, list) do
    %{
      schema: schema,
      list: list,
      link_map: %{},
      view: view,
    }
  end

  def get_resp_links(resp, record) do
    if resp.view.module_info(:functions) |> Enum.member?({:links, 2}) do
      resp.view.links(resp, record)
    else
      %{}
    end
  end

  def render_links(resp) do
    Enum.flat_map(resp.link_map, fn {schema, links} ->
      Enum.map(links, fn link ->
        data = link.view.encode(link.data)

        %{
          id: data.id,
          schema: schema,
          data: data
        }
      end)
    end)
  end

  def init_link_map(resp) do
    if resp.view.module_info(:functions) |> Enum.member?({:links, 2}) do
      Enum.reduce(resp.list, resp, fn row, resp ->
        resp.view.links(resp, row)
      end)
    else
      %{link_map: %{}}
    end
  end

  def included_in_resp?(resp, schema, id) do
    cond do
      resp.schema == schema && Enum.any?(resp.list, fn record -> record.id == id end) ->
	true
      true ->
	case Map.fetch(resp.link_map, schema) do
          {:ok, list} ->
            Enum.any?(list, fn record -> record[:id] == id end)

          :error ->
            false
	end
    end
  end

  def add_link(resp, schema, link) do
    add_links(resp, schema, [link])
  end

  def add_links(resp, schema, links) do
    filtered = Enum.reject(links, fn link -> included_in_resp?(resp, schema, link.id) end)

    updated_list =
      case Map.fetch(resp.link_map, schema) do
        {:ok, existing_values} ->
          existing_values ++ filtered

        :error ->
          links
      end

    link_map = Map.put(resp.link_map, schema, updated_list)
    resp = Map.put(resp, :link_map, link_map)

    # check if the view module of the link got `links` method defined
    # if it does, call it
    # if it doesn't, return acc
    Enum.reduce(filtered, resp, fn link, resp ->
      if link.view.module_info(:functions) |> Enum.member?({:links, 2}) do
        link.view.links(resp, link.data)
      else
        resp
      end
    end)
  end

  def add_user(resp, id) do
    case included_in_resp?(resp, :users, id) do
      true ->
        resp

      false ->
        add_link(resp, :users, link(Sway.Accounts.get_user!(id), SwayWeb.UserView))
    end
  end

  def add_room(resp, id) do
    case included_in_resp?(resp, :rooms, id) do
      true ->
        resp

      false ->
        add_link(resp, :rooms, link(Sway.Rooms.get_room!(id), SwayWeb.RoomView))
    end
  end

  def add_room_member(resp, id) do
    case included_in_resp?(resp, :room_members, id) do
      true ->
        resp

      false ->
        add_link(
          resp,
          :room_members,
          link(Sway.Rooms.get_room_member!(id), SwayWeb.RoomMemberView)
        )
    end
  end

  def add_workspace(resp, id) do
    case included_in_resp?(resp, :workspaces, id) do
      true ->
        resp

      false ->
        add_link(
          resp,
          :workspaces,
          link(Sway.Workspaces.get_workspace!(id), SwayWeb.WorkspaceView)
        )
    end
  end
end
