import { GroupCard } from "@/components/group-card"

const groups = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: "Post Punk Lisboa",
  location: "Lyon",
  rating: 4.7,
  description: "Do you like post punk music, drinking beers, and oking cigarettes (or not)? Are you still wondering",
  members: 122,
  image: "/concert-crowd-bw.png",
  memberAvatars: ["/person-avatar-1.png", "/diverse-person-avatar-2.png", "/person-avatar-3.png"],
}))

export function GroupGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  )
}
