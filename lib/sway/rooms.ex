defmodule Sway.Rooms do
  @moduledoc """
  The Rooms context.
  """

  import Ecto.Query, warn: false
  alias Sway.Repo
  alias Sway.Rooms.PrivateMember

  alias Sway.Rooms.Room

  @doc """
  Returns the list of rooms.

  ## Examples

      iex> list_rooms()
      [%Room{}, ...]

  """
  def list_rooms do
    Repo.all(Room)
  end

  @doc """
  Gets a single room.

  Raises `Ecto.NoResultsError` if the Room does not exist.

  ## Examples

      iex> get_room!(123)
      %Room{}

      iex> get_room!(456)
      ** (Ecto.NoResultsError)

  """
  def get_room!(id), do: Repo.get!(Room, id)

  def get_room_by_name(workspace_id, name) when is_binary(name) do
    Repo.get_by(Room, workspace_id: workspace_id, name: name)
  end

  def get_room_by_slug(workspace_id, slug) when is_binary(slug) do
    Repo.get_by(Room, workspace_id: workspace_id, name: slug)
  end

  def get_default_room(workspace_id) do
    Repo.get_by(Room, workspace_id: workspace_id, is_default: true)
  end

  def list_by_workspace_id(workspace_id) do
    from(r in Sway.Rooms.Room,
      where: r.workspace_id == ^"#{workspace_id}",
      where: r.is_private == false,
      order_by: r.id
    )
    |> Sway.Repo.all()
  end

  def list_private_rooms_by_user_id(workspace_id, user_id) do
    from(r in Room,
      join: pm in PrivateMember,
      on: r.id == pm.room_id,
      where: r.workspace_id == ^workspace_id,
      where: pm.user_id == ^user_id,
      where: r.is_private == true,
      select: r
    )
    |> Repo.all()
  end

  @doc """
  Creates a room.

  ## Examples

      iex> create_room(%{field: value})
      {:ok, %Room{}}

      iex> create_room(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_room(attrs \\ %{}) do
    %Room{}
    |> Room.changeset(attrs)
    |> Repo.insert()
  end

  def create_or_activate_room(attrs \\ %{}) do
    existing =
      Repo.get_by(Room, workspace_id: attrs[:workspace_id], slug: attrs[:slug], is_active: false)

    case existing do
      nil ->
        create_room(attrs)

      room ->
        update_room(room, %{is_active: true})
    end
  end

  def soft_delete_room(id) do
    room = get_room!(id)
    update_room(room, %{is_active: false})
  end

  @doc """
  Updates a room.

  ## Examples

      iex> update_room(room, %{field: new_value})
      {:ok, %Room{}}

      iex> update_room(room, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_room(%Room{} = room, attrs) do
    room
    |> Room.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a room.

  ## Examples

      iex> delete_room(room)
      {:ok, %Room{}}

      iex> delete_room(room)
      {:error, %Ecto.Changeset{}}

  """
  def delete_room(%Room{} = room) do
    Repo.delete(room)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking room changes.

  ## Examples

      iex> change_room(room)
      %Ecto.Changeset{data: %Room{}}

  """
  def change_room(%Room{} = room, attrs \\ %{}) do
    Room.changeset(room, attrs)
  end

  def create_private_room_with_members(attrs, user_ids) do
    Ecto.Multi.new()
    |> Ecto.Multi.insert(:room, Room.changeset(%Room{}, Map.put(attrs, :is_private, true)))
    |> Ecto.Multi.run(:members, fn repo, %{room: room} ->
      results = user_ids
      |> Enum.map(fn user_id ->
        Sway.Rooms.PrivateMember.changeset(%PrivateMember{}, %{
          room_id: room.id,
          user_id: user_id
        })
      end)
      |> Enum.map(&repo.insert/1)

      {:ok, results}
    end)
    |> Repo.transaction()
  end
end
