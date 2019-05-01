import * as React from "react";
import { Carousel } from "react-responsive-carousel";
import { IImage } from "../../../../contracts";

// ignored from coverage as it is hard coded use of third party lib
/* istanbul ignore next */
export class BuildCarousel extends React.Component<{ data: IImage[] }, {}>{
    render() {
        return (
            <>
                <h2>React Carousel!</h2>
                <Carousel showArrows={true} /* onChange={onChange} onClickItem={onClickItem} onClickThumb={onClickThumb}*/>
                    {this.props.data.map((x, i) =>
                        <div key={`k-${i}-${x.id}`}>
                            <img src={x.url} title={x.name} />
                            <p className="legend">{x.label}</p>
                        </div>
                    )}
                </Carousel>
            </>
        );
    }
}