export function ProjectEditor() {

    return (

        <PanelGroup direction="horizontal">

            <Panel id="panel-editor" defaultSize={600} minSize={400} maxSize={800}>
                <ProjectContent />
            </Panel>

            {/* If there iis a siderbar */}

        </PanelGroup>

    )
}