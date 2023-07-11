//
//  RingGizmoPropertyGroup.ts
//
//  Created by Julien Merzoug on 19 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import EntityPropertyFlags, { EntityPropertyList } from "./EntityPropertyFlags";


// WEBRTC TODO: Replace Record<string, never> with RingGizmoPropertyGroupProperties.
type RingGizmoPropertyGroupSubclassData = {
    bytesRead: number;
    properties: Record<string, never>;
};


class RingGizmoPropertyGroup {
    // C++  class RingGizmoPropertyGroup : public PropertyGroup

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: EntityPropertyFlags): RingGizmoPropertyGroupSubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int RingGizmoPropertyGroup::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_START_ANGLE)) {
            // WEBRTC TODO: Read startAngle property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_END_ANGLE)) {
            // WEBRTC TODO: Read endAngle property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_INNER_RADIUS)) {
            // WEBRTC TODO: Read innerRadius property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_INNER_START_COLOR)) {
            // WEBRTC TODO: Read innerStartColor property.
            dataPosition += 3;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_INNER_END_COLOR)) {
            // WEBRTC TODO: Read innerEndColor property.
            dataPosition += 3;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_OUTER_START_COLOR)) {
            // WEBRTC TODO: Read outerStartColor property.
            dataPosition += 3;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_OUTER_END_COLOR)) {
            // WEBRTC TODO: Read outerEndColor property.
            dataPosition += 3;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_INNER_START_ALPHA)) {
            // WEBRTC TODO: Read innerStartAlpha property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_INNER_END_ALPHA)) {
            // WEBRTC TODO: Read innerEndAlpha property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_OUTER_START_ALPHA)) {
            // WEBRTC TODO: Read outerStartAlpha property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_OUTER_END_ALPHA)) {
            // WEBRTC TODO: Read outerEndAlpha property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_HAS_TICK_MARKS)) {
            // WEBRTC TODO: Read hasTickMarks property.
            dataPosition += 1;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_MAJOR_TICK_MARKS_ANGLE)) {
            // WEBRTC TODO: Read majorTickMarksAngle property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_MINOR_TICK_MARKS_ANGLE)) {
            // WEBRTC TODO: Read minorTickMarksAngle property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_MAJOR_TICK_MARKS_LENGTH)) {
            // WEBRTC TODO: Read majorTickMarksLength property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_MINOR_TICK_MARKS_LENGTH)) {
            // WEBRTC TODO: Read minorTickMarksLength property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_MAJOR_TICK_MARKS_COLOR)) {
            // WEBRTC TODO: Read majorTickMarksColor property.
            dataPosition += 3;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_MINOR_TICK_MARKS_COLOR)) {
            // WEBRTC TODO: Read minorTickMarksColor property.
            dataPosition += 3;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {}
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default RingGizmoPropertyGroup;
export type { RingGizmoPropertyGroupSubclassData };
