defmodule Sway.Statuses do
  @moduledoc """
  The Statuses context.
  """

  import Ecto.Query, warn: false
  alias Sway.Repo

  alias Sway.Statuses.Status

  @doc """
  Returns the list of statuses.

  ## Examples

      iex> list_statuses()
      [%Status{}, ...]

  """
  def list_statuses do
    Repo.all(Status)
  end

  @doc """
  Gets a single status.

  Raises `Ecto.NoResultsError` if the Status does not exist.

  ## Examples

      iex> get_status!(123)
      %Status{}

      iex> get_status!(456)
      ** (Ecto.NoResultsError)

  """
  def get_status!(id), do: Repo.get!(Status, id)

  def get_latest_status(user_id, workspace_id) do
    status =
      from(s in Status,
        where: s.user_id == ^user_id and s.workspace_id == ^workspace_id,
        order_by: [desc: s.inserted_at],
        limit: 1
      )
      |> Repo.one()

    case status do
      %Status{} ->
        status

      _ ->
        room = Sway.Rooms.get_default_room(workspace_id)

        with {:ok, %Status{} = status} <-
               create_status(%{
                 user_id: user_id,
                 room_id: room.id,
                 status: :focus,
                 workspace_id: workspace_id,
                 speaker_on: true
               }) do
          status
        end
    end
  end

  def get_updates_by_user(user_id) do
    query =
      from s in Status,
        where: s.user_id == ^user_id and (s.message != "" or s.emoji != ""),
        order_by: [desc: s.inserted_at]

    Repo.all(query)
  end

  def get_updates_by_room(room_id) do
    query =
      from s in Status,
        where: s.room_id == ^room_id and (s.message != "" or s.emoji != ""),
        order_by: [desc: s.inserted_at]

    Repo.all(query)
  end

  @doc """
  Creates a status.

  ## Examples

      iex> create_status(%{field: value})
      {:ok, %Status{}}

      iex> create_status(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_status(attrs \\ %{}) do
    %Status{}
    |> Status.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a status.

  ## Examples

      iex> update_status(status, %{field: new_value})
      {:ok, %Status{}}

      iex> update_status(status, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_status(%Status{} = status, attrs) do
    status
    |> Status.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a status.

  ## Examples

      iex> delete_status(status)
      {:ok, %Status{}}

      iex> delete_status(status)
      {:error, %Ecto.Changeset{}}

  """
  def delete_status(%Status{} = status) do
    Repo.delete(status)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking status changes.

  ## Examples

      iex> change_status(status)
      %Ecto.Changeset{data: %Status{}}

  """
  def change_status(%Status{} = status, attrs \\ %{}) do
    Status.changeset(status, attrs)
  end
end
