# Goal

Build the `/editor` home screen and add project dialogs/sidebar actions. No API calls or persistance yet.

## Edit Home

 Reuse the exisiting editor layout. Do not modify the navbar or sidebar behavior.

 In the center of the page add:
    - heading: `Creat a project or open an existing one`
    - description: `Start a new architecture workspace or choose a project from the sidebar`.
    - `New Project` button with a `+` icon

Keep the layout minimal. Do not wrap this content in cards.

Clicking `New Project` should open the Create Project Dialog.

## Dialogs

### Create Dialog

- Project Name input
- live slig preview based on the name
- preview upodate as the uset types

### Rename Project

- prefilled project name input
- current priject name shown in the description
- input auto-focuses
- Enter Submits

### Delete Project

- destructive confirmation only
- no input
- confirm button uses destructivr styling

## Sidebar

Add project item actions:

- rename
- delete

Show action only for owned projects.

hide action for shared/collaborator projects.

on Mobile:

- tapping outside the sidebat closes it
- add a backdrop scrim

## Implementation

Creat a dedicated hook to manage:

- dialog state
- form state
- loading state

Wire:

- editor home `New Prject` -> create dialog
- sidebar create ->  create dialog
- sidebar rename -> Rename dialog
- sidebar delete -> Delete dialog

use mock project data only. Do not add API calls or persistence.

## check when done

- Sidebar actions are wired
- slug preview works
- no typescripts errors
- no lint errors
