import { Box, useTheme } from '@suid/material';
import Modal from '@suid/material/Modal';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import { For, JSX, createComponent, createContext, createSignal, useContext } from 'solid-js';

interface Response<ReturnType> {
    response: 'positive' | 'negative';
    returns?: ReturnType;
}

interface SmulogButtons {
    positive: () => JSX.Element;
    negative?: () => JSX.Element;
}

interface SmulogData<ReturnType, Props> {
    smulog: Smulog<ReturnType, Props>;
    option: SmulogOption;
    props: any;
}

interface SmulogOption {
    title?: string;
    cancelOnTouchOutside?: boolean;
}

interface SmulogContainerContext<ReturnType, Props> {
    add(dialog: SmulogData<ReturnType, Props>): void;
    dismiss(dialog: Smulog<any, any>): void;
}

interface SmulogContext<ReturnType> {
    setButtons(buttons: SmulogButtons): void;
    close(response: Response<ReturnType>): void;
    close(): void;
}

const SmulogContainerContext = createContext<SmulogContainerContext<any, any>>();
const SmulogContext = createContext<SmulogContext<any>>();

class Smulog<ReturnType, Props> {
    private _closeCall?: (response: Response<ReturnType>) => void;

    public get closeCall() {
        return this._closeCall;
    }

    public get component(): (props: Props) => JSX.Element {
        return this._component;
    }

    public constructor(private _component: (props: Props) => JSX.Element) {

    }

    async show(context: SmulogContainerContext<ReturnType, Props>, option: SmulogOption, props: Props): Promise<Response<ReturnType>> {
        context.add({
            smulog: this,
            option,
            props
        });

        return new Promise<Response<ReturnType>>((resolve) => {
            this._closeCall = response => {
                context.dismiss(this);
                resolve(response);
            };
        });
    }
}

export function SmulogContainer(props: { children: JSX.Element }) {
    const theme = useTheme();
    const [smulogDataList, setSmulogDataList] = createSignal<Array<SmulogData<any, any>>>([]);

    const context: SmulogContainerContext<any, any> = {
        add(dialog: SmulogData<any, any>) {
            setSmulogDataList([...smulogDataList(), dialog]);
        },
        dismiss: (dialog: Smulog<any, any>) => {
            setSmulogDataList([...smulogDataList().filter(data => data.smulog !== dialog)]);
        }
    };

    return (
        <SmulogContainerContext.Provider
            value={context}>
            <>
                {props.children}
                <For each={smulogDataList()}>
                    {
                        data => {
                            const [buttons, setButtons] = createSignal<SmulogButtons>({
                                positive: () => <></>,
                            });

                            return createComponent(() => {
                                return (
                                    <Modal
                                        open={true}
                                        onClose={(event, reason) => {
                                            data.smulog.closeCall?.({
                                                response: 'negative'
                                            });    
                                        }}>
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                            <SmulogContext.Provider value={{
                                                close: (response?: Response<any>) => {
                                                    if (response === undefined) {
                                                        data.smulog.closeCall?.({
                                                            response: 'negative'
                                                        });
                                                    } else {
                                                        data.smulog.closeCall?.(response);
                                                    }
                                                },
                                                setButtons: (buttons: SmulogButtons) => {
                                                    setButtons(buttons);
                                                }
                                            }}>
                                                <Stack
                                                    sx={{
                                                        width: '540px',
                                                        height: 'auto',
                                                        maxWidth: '100vw',
                                                        maxHeight: '80%',
                                                        backgroundColor: theme.palette.background.paper,
                                                        boxShadow: "0px 0px 32px rgba(0,0,0,0.2)",
                                                        borderRadius: 1
                                                    }}>

                                                    <Stack
                                                        sx={{
                                                            height: 'auto',
                                                            maxHeight: '100%',
                                                        }}
                                                        direction="column">
                                                        {
                                                            data.option.title &&
                                                            <Stack
                                                                sx={{
                                                                    padding: '0px 24px'
                                                                }}>

                                                                <Typography
                                                                    variant="h6"
                                                                    sx={{
                                                                        padding: '16px 0px',
                                                                        color: theme.palette.text.primary
                                                                    }}>
                                                                    {data.option.title}
                                                                </Typography>

                                                            </Stack>
                                                        }

                                                        <Stack
                                                            sx={{
                                                                flex: 1,
                                                                height: '0px',
                                                                padding: '0px 24px'
                                                            }}>

                                                            {createComponent(data.smulog.component, data.props)}

                                                        </Stack>

                                                        <Stack
                                                            direction="row"
                                                            justifyContent="end"
                                                            spacing="8px"
                                                            sx={{
                                                                padding: '8px'
                                                            }}>
                                                            {
                                                                createComponent(buttons().negative ?? (() => <></>), {})
                                                            }
                                                            {
                                                                createComponent(buttons().positive, {})
                                                            }
                                                        </Stack>
                                                    </Stack>
                                                </Stack>
                                            </SmulogContext.Provider>
                                        </Box>
                                    </Modal>
                                )

                            }, {})
                        }
                    }
                </For>
            </>
        </SmulogContainerContext.Provider>
    )
}

export function useDialogContainer() {
    const context = useContext(SmulogContainerContext);

    if (context === undefined) {
        throw new Error('Component must be used within a DialogContainer');
    }

    return context;
}

export function useDialog<ReturnType>(): SmulogContext<ReturnType> {
    const context = useContext(SmulogContext);

    if (context === undefined) {
        throw new Error('Component must be used within a Dialog');
    }

    return context;
}

export function createSmulog<ReturnType, Props>(Component: (props: Props) => JSX.Element): Smulog<ReturnType, Props> {
    return new Smulog<ReturnType, Props>(Component);
}
