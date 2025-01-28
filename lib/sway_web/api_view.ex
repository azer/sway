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

  def get_by_id(schema, id) do
    case schema do
      :users ->
	Sway.Accounts.get_user!(id)
      :workspaces ->
	Sway.Workspaces.get_workspace!(id)
    end
  end

  def add_link(resp, schema, view, id) do
    case included_in_resp?(resp, schema, id) do
      true ->
        resp

      false ->
        add_links(
          resp,
          schema,
          [link(get_by_id(schema, id), view)]
        )
    end
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


end
