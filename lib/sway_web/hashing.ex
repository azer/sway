defmodule SwayWeb.Hashing do
  @salt "sway"
  @min_length 8

  def encode_workspace(id), do: encode(:workspace, id)
  def decode_workspace(id), do: decode(:workspace, id)
  def encode_room(id), do: encode(:room, id)
  def decode_room(id), do: decode(:room, id)
  def encode_user(id), do: encode(:user, id)
  def decode_user(id), do: decode(:user, id)
  def encode_status(id), do: encode(:status, id)
  def decode_status(id), do: decode(:status, id)
  def encode_private_member(id), do: encode(:private_member, id)
  def decode_private_member(id), do: decode(:private_member, id)
  def encode_membership(id), do: encode(:membership, id)
  def decode_membership(id), do: decode(:membership, id)

  defp encode(entity, id) do
    s = Hashids.new(salt: "#{@salt}:#{entity}", min_len: @min_length)
    Hashids.encode(s, id)
  end

  defp decode(entity, hash) do
    s = Hashids.new(salt: "#{@salt}:#{entity}", min_len: @min_length)
    hd Hashids.decode!(s, hash)
  end
end
