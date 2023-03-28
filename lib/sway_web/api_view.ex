defmodule SwayWeb.APIView do
  def link(record, view) do
    %{
      id: record.id,
      view: view,
      data: record
    }
  end

  def many_links(rows, reduce_fn) do
    Enum.reduce(rows, %{}, reduce_fn)
  end

  def append_user(acc, id) do
    case has_link?(acc, :users, id) do
      true ->
        acc

      false ->
        append_links(acc, :users, [link(Sway.Accounts.get_user!(id), SwayWeb.UserView)])
    end
  end

  def append_room(acc, id) do
    case has_link?(acc, :rooms, id) do
      true ->
        acc

      false ->
        append_links(acc, :rooms, [link(Sway.Rooms.get_room!(id), SwayWeb.RoomView)])
    end
  end

  def append_workspace(acc, id) do
    case has_link?(acc, :workspaces, id) do
      true ->
        acc

      false ->
        append_links(acc, :workspaces, [
          link(Sway.Workspaces.get_workspace!(id), SwayWeb.WorkspaceView)
        ])
    end
  end

  def append_links(acc, key, links) do
    updated_list =
      case Map.fetch(acc, key) do
        {:ok, existing_values} ->
          existing_values ++ links

        :error ->
          links
      end

    acc = Map.put(acc, key, updated_list)

    Enum.reduce(links, acc, fn link, acc ->
      if link.view.module_info(:functions) |> Enum.member?({:links, 2}) do
        link.view.links(link.data, acc)
      else
        acc
      end
    end)
  end

  def has_link?(acc, key, id) do
    case Map.fetch(acc, key) do
      {:ok, records} ->
        Enum.any?(records, fn record -> record[:id] == id end)

      :error ->
        false
    end
  end

  def render_links(acc) do
    Enum.flat_map(acc, fn {key, links} ->
      Enum.map(links, fn link ->
	data = link.view.encode(link.data)
        %{
          id: data.id,
          schema: key,
          data: data
        }
      end)
    end)
  end

  def render_row(row, schema) do
    %{
      id: row.id,
      schema: schema,
      data: row
    }
  end
end
