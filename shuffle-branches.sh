set -e
git checkout default-transition
git rebase main
git checkout talk-slide-from-side
git rebase --onto default-transition origin/default-transition
git checkout fixed-header
git rebase --onto talk-slide-from-side origin/talk-slide-from-side
git checkout header-bug
git rebase --onto fixed-header origin/fixed-header
git checkout steadier-desktop-transition
git rebase --onto header-bug origin/header-bug
git checkout video-transition
git rebase --onto steadier-desktop-transition origin/steadier-desktop-transition
