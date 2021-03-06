# Nodes

A playground to do some experiments with the HTML5 canvas element. But mostly experimenting 2D particles physics actually...

Trying to get a reusable and pretty accurate set of objects and methods to deal with points, vectors, forces and collisions in an animated two dimensional world. With or without gravity and drag.

# History

Releases tagged *R_x* are not meant to be any kind of incremental versionning to the playground as a whole. Instead they are milestones of interesting behaviors.

## R_7

Performance greatly improved, but still far from last release's target. WebGL required to continue.
Branched-out requestAnimationFrame polyfill as it seem slightly slower (by 5-6 fps), need more testing.

Non performance-related changes:

    - Switched to 1px squares instead of circles
    - Added proportional shockwaves based on mouse down time.
    - Added Mr.doob's Stat.js framerate monitor

## R_6

The whole is now more like a shockwave simulator with the help of context.globalCompositeOperation = 'lighter'

Need performance improvement! Target: 100000 particles at 60fps

That should be pretty easy switching to requestAnimationFrame, removing all not really important math operations, switching to squares... or is it better to start off as a whole  new project?

## R_5.1

Added a footer note about keyboard controls. Shock waves now also triggered by the "s" key.

## R_5

Added visible velocity vector to nodes. Got rid of mass and color randomization.

## R_4

Randomized nodes mass and radius.

Because the blast is a proper force vector applied to nodes as massive objects, the velocity gained from the blast will depend on the object's mass: Greater velocity for lighter nodes. (Newton's second law of motion: F = ma)

## R_3

Randomized nodes colors

## R_2.1

Animated shock waves to support the mouse click blast

## R_2

Exit gravity, push to 100 nodes. A mouse click blast away all nodes close to the mouse position

## R_1

10 nodes properly attracted by gravity and bouncing off the ground
